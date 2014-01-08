/* consumes mount queue
 * pushing those files to the remote
 */

var fs = require('fs'),
    path = require('path'),
    nano = require('nano'),
    async = require('async'),
    util = require('../util');

module.exports = function (job) {
  var mount = job.source;
  var remote = job.target;
  var db = nano(remote),
      filepath = util.filepath(mount);

  function update (task, callback) {
    console.log(task.id, 'checking remote update');

    var fp = filepath(task.id);

    db.get(task.id, function (err, doc) {
      if (err) {
        if (err.status_code === 404) {
          doc = {
            _id: task.id,
            timestamp: 0
          };
        } else {
          throw err;
        }
      }
      var hash = util.getMd5Hash(fp);
      if (doc.hash && hash === doc.hash) {
        console.log(task.id, '> rejected remote: identical hash');
        callback();
      } else if (task.timestamp >= doc.timestamp) {
        console.log(task.id, '> remotely updating');

        doc.timestamp = task.timestamp;
        doc.hash = hash;
        
        fs.readFile(fp, function (err, data) {
          doc._attachments = {
            file: {
              content_type: util.filetype(task.id),
              data: data.toString('base64')
            }
          };

          db.insert(doc, callback);
        });
      } else {
        console.log(task.id, '> rejected remote: smaller timestamp');
        callback();
      }
    });
  }

  function destroy (task, callback) {
    var doc_id = task.id;
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