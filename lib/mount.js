/* Manages local directory
 * Pushes changes to mount queue
 */

var watcher = require('watch'),
    dive = require('dive'),
    fs = require('fs'),
    path = require('path'),
    util = require('./util');

module.exports = function (mount, queue) {
  var file_id = util.file_id(mount);

  function update (f, stat) {
    queue.update.push({
      id: file_id(f),
      timestamp: new Date(stat.mtime).getTime()
    });
  }

  function destroy (f, stat) {
    queue.destroy.push({
      id: file_id(f),
      timestamp: new Date(stat.mtime).getTime()
    })
  }

  function list (done) {
    dive(mount, function (err, f) {
      if (err) throw err;
      fs.stat(f, function (err, stat) {
        if (err) throw err;
        update(f, stat);
      });
    }, done);
  }

  function watch () {
    watcher.createMonitor(mount, function (monitor) {
      monitor.on('created', update);
      monitor.on('changed', update);
      monitor.on('removed', destroy);
    });
  }

  return {
    list: list,
    watch: watch
  };
};