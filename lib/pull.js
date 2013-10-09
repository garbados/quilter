/* consumes remote queue
 * pulling those files to the local
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
    var fp = filepath(task.id);
    fs.stat(fp, function (err, stat) {
      if (err && err.code !== 'ENOENT') throw err;

      var file_timestamp = stat ? new Date(stat.mtime).getTime() : 0;
      if (task.timestamp > file_timestamp) {
        db.attachment.get(task.id, 'file')
          .on('error', function (err) { throw err; })
          .on('end', callback)
          .pipe(fs.createWriteStream(fp));
      } else {
        callback();
      }
    });
  }

  function destroy (task, callback) {
    var fp = filepath(task.id);
    fs.unlink(fp, callback);
  }

  return {
    update: async.queue(update),
    destroy: async.queue(destroy)
  };
};