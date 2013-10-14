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
    console.log(task.id, 'checking local update');
    function _create () {
      console.log(task.id, '> locally updating');
      util.mkdirParent(path.dirname(fp), undefined, function (err) {
        if (err) throw err;

        db.attachment.get(task.id, 'file')
          // .on('data', function (data) { console.log(new Date(), task.id, data.toString()); })
          .on('error', function (err) { throw err; })
          .on('end', callback)
          .pipe(fs.createWriteStream(fp));
      });
    }

    var fp = filepath(task.id);
    fs.stat(fp, function (err, stat) {
      if (err) {
        if (err.code === 'ENOENT') {
          _create();
        } else {
          throw err;
        }
      } else {
        var file_timestamp = stat ? new Date(stat.mtime).getTime() : 0;
        var hash = util.getMd5Hash(fp);
        if (task.hash === hash) {
          console.log(task.id, '> rejected local: identical hash');
          callback();
        } else if (task.timestamp > file_timestamp) {
          _create();
        } else {
          console.log(task.id, '> rejected local: smaller timestamp');
          callback();
        }
      }
    });
  }

  function destroy (task, callback) {
    var fp = filepath(task.id);
    if (fp[fp.length-1] === path.sep) {
      fs.rmdir(fp, callback);
    } else {
      fs.unlink(fp, callback); 
    }
  }

  return {
    update: async.queue(update),
    destroy: async.queue(destroy)
  };
};