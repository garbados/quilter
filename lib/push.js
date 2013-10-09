/* consumes mount queue
 * pushing those files to the remote
 */

var fs = require('fs'),
    path = require('path'),
    nano = require('nano'),
    async = require('async'),
    util = require('./util');

module.exports = function (mount, remote) {
  var db = nano(remote),
      filepath = util.filepath(mount);

  function update (task, callback) {
    db.get(task.id, function (err, doc) {
      if (err) {
        if (err.status_code === 404) {
          doc = {
            _id: task.id,
            timestamp: 0
          }
        } else {
          throw err;
        }
      }
      if (task.timestamp >= doc.timestamp) {
        doc.timestamp = task.timestamp;
        db.insert(doc, function (err, body) {
          if (err) throw err;
          fs.createReadStream(filepath(task.id))
            .pipe(db.attachment.insert(
              body.id, 
              'file', 
              null, 
              util.filetype(task.id[task.id.length-1]), 
              { rev: body.rev })
            )
            .on('error', function (err) { throw err; })
            .on('end', callback)
        });
      } else {
        callback();
      }
    });
  }

  function destroy (task, callback) {
    var doc_id = task.id;
    console.log(task);
    db.head(doc_id, function (err, _, headers) {
      if (err && err.status_code !== 404) throw err;
      if (headers && headers.etag) {
        var rev = headers.etag.replace(/"/g, '');
        db.destroy(doc_id, rev, callback); 
      } else {
        callback();
      }
    });
  }

  return {
    update: async.queue(update),
    destroy: async.queue(destroy)
  };
};