var push = require('./push');
var pull = require('./pull');
var async = require('async');

function list (done) {
  async.parallel([
    push.list.bind(this),
    pull.list.bind(this)
  ], done);
}

function watch (done) {
  var self = this;
  async.series([
    list.bind(this),
    async.parallel.bind(async, [
      function (done) {
        push.watch.call(self, function (watcher) {
          done(null, watcher);
        });
      },
      function (done) {
        pull.watch.call(self, function (watcher) {
          done(null, watcher);
        });
      }
    ])
  ], function (err, res) {
    if (err) return done(err);

    var monitors = res[1];
    
    done({
      monitors: monitors,
      close: function (done) {
        async.parallel(monitors.map(function (monitor) {
          return monitor.close.bind(monitor);
        }), done);
      }
    });
  });
}

module.exports = {
  list: list,
  watch: watch
};