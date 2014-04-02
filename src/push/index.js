var watcher = require('watch');
var util = require('../util');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var dive = require('dive');
var docs = require('../docs');

function update (id, done) {
  var self = this;
  async.parallel([
    // get doc state
    docs.remote.get.bind(self, id),
    // get file state
    docs.local.get.bind(self, id)
  ], function (err, res) {
    var doc = res[0];
    var file = res[1];
    if (err) {
      if (err.status_code === 404) {
        docs.remote.update.call(self, id, done);
      } else {
        done(err);
      }
    } else {
      if (doc.hash === file.hash) {
        // reject; identical hashes, nothing to do
        done();
      } else if (doc.timestamp > file.timestamp) {
        // reject; remote file is newer
        done();
      } else {
        // EGGXECUTE PLAN EGG
        docs.remote.update.call(self, id, done);
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
    queue.push(id);
  }, function () {
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

    // direct events to the appropriate handler
    function event_handler (task, done) {
      var id = util.file.id.call(self, task.fp);
      if (task.event === 'update') {
        // handle creation and updates
        me.emit('update', id);
        update.call(self, id, done);
      } else if (task.event === 'destroy') {
        // handle file removal
        me.emit('destroy', id);
        destroy.call(self, id, done);
      } else {
        // throw unknown event
        done({
          error: "unknown event",
          args: arguments
        });
      }
    }

    // use a queue to process changes
    var queue = me.queue = async.queue(event_handler);

    // begin listening :O
    watcher.watchTree(self.mount, {
      ignoreDotFiles: true
    }, function (f, curr, prev) {
      if (typeof f == "object" && prev === null && curr === null) {
        // Finished walking the tree
        done(me);
      } else if (curr.nlink === 0) {
        // f was removed
        queue.push({
          task: 'destroy',
          fp: f
        });
      } else {
        // f was changed or created
        queue.push({
          task: 'update',
          fp: f
        });
      }
    });

    return this;
  }

  inherits(Watcher, EventEmitter);

  // quit
  Watcher.prototype.close = function (done) {
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