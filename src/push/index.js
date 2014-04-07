var watcher = require('watch');
var util = require('../util');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var dive = require('dive');
var docs = require('../docs');
var log = require('winston');

function update (id, done) {
  var self = this;
  async.parallel([
    // get file state
    docs.local.get.bind(self, id),
    // get doc state
    docs.remote.get.bind(self, id)
  ], function (err, res) {
    if (err) {
      if (err.status_code === 404) {
        log.info(id, 'updating');
        docs.remote.update.call(self, id, done);
      } else {
        done(err);
      }
    } else {
      var should_update = docs.should_update.apply(null, res);
      if (should_update) {
        log.info(id, 'updating');
        docs.remote.update.call(self, id, done);
      } else {
        log.info(id, 'skipping');
        done();
      }
    }
  });
}

var destroy = docs.remote.destroy;

function list (done) {
  var self = this;
  var queue = async.queue(update.bind(this));

  dive(this.mount, function (err, f) {
    if (err) throw(err);
    var id = util.file.id.call(self, f);
    log.info(id, 'inspecting');
    queue.push(id);
  }, function () {
    log.info('finishing...');
    if (queue.length()) {
      queue.drain = done;
    } else {
      done();
    }
  });
}

function watch (done) {
  var self = this;

  function Watcher (done) {
    EventEmitter.call(this);
    var me = this;

    me.on('update', function (id) {
      log.info(id, 'inspecting');
    });

    me.on('destroy', function (id) {
      log.info(id, 'destroying');
    });

    // direct events to the appropriate handler
    function event_handler (task, done) {
      var id = util.file.id.call(self, task.fp);
      // TODO handle unexpected events gracefully
      if (task.event === 'update') {
        // handle creation and updates
        me.emit('update', id);
        update.call(self, id, done);
      } else if (task.event === 'destroy') {
        // handle file removal
        me.emit('destroy', id);
        destroy.call(self, id, done);
      }
    }

    // use a queue to process changes
    var queue = me.queue = async.queue(event_handler);

    // begin listening :O)
    watcher.createMonitor(self.mount, {
      ignoreDotFiles: true
    }, function (monitor) {
      ['created', 'changed', 'removed'].forEach(function (event) {
        monitor.on(event, function (fp) {
          queue.push({
            event: (event === 'removed') ? 'destroy' : 'update',
            fp: fp
          });
        });
      });

      me.monitor = monitor;
      done(me);
    });

    return this;
  }

  inherits(Watcher, EventEmitter);

  // quit
  Watcher.prototype.close = function (done) {
    log.info('finishing...');
    // stop listening to monitor
    this.monitor.removeAllListeners();
    // stop listeners on the watcher itself
    this.removeAllListeners();
    // finish processing
    if (this.queue.length()) {
      this.queue.drain = done;
    } else {
      done();
    }
  };

  new Watcher(done);
}

module.exports = {
  update: update,
  destroy: destroy,
  list: list,
  watch: watch
};