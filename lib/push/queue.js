/* Manages local directory
 * Pushes changes to mount worker
 */

var watcher = require('watch'),
    dive = require('dive'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    util = require('../util');

module.exports = function (job, done) {
  var mount = util.resolvePath(job.local);
  var worker = require('./worker')(job);
  var file_id = util.file_id(mount);

  function update (f, stat) {
    if (f.indexOf('_design') !== 0) {
      if (stat.isFile()) {
        worker.update.push({
          id: file_id(f),
          timestamp: new Date(stat.mtime).getTime()
        }); 
      }
    }
  }

  function destroy (f, stat) {
    if (f.indexOf('_design') !== 0) {
      worker.destroy.push({
        id: file_id(f),
        timestamp: new Date(stat.mtime).getTime()
      });
    }
  }

  function list (done) {
    dive(mount, function (err, f) {
      if (err) throw err;
      fs.stat(f, function (err, stat) {
        if (err) throw err;
        update(f, stat);
      });
    }, function () {
      if (worker.update.length()) {
        worker.update.drain = done; 
      } else {
        done();
      }
    });
  }

  function watch () {
    // TODO exit condition
    watcher.createMonitor(mount, {
      ignoreDotFiles: true
    }, function (monitor) {
      monitor.on('created', update);
      monitor.on('changed', update);
      monitor.on('removed', destroy);
    });
  }

  var tasks = [
    util.mkdb.bind(util, job),
    list
  ];
  if (job.watch) tasks.push(watch);
  async.series(tasks, done);
};