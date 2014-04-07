var inherits = require('util').inherits;
var docs = require('../docs');
var path = require('path');
var fs = require('fs');
var nano = require('nano');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var log = require('winston');

function update (id, done) {
  var self = this;
  async.parallel([
    // get doc state
    docs.remote.get.bind(self, id),
    // get file state
    docs.local.get.bind(self, id)
  ], function (err, res) {
    if (err) {
      if (err.code === 'ENOENT') {
        log.info(id, 'updating');
        docs.local.update.call(self, id, done);
      } else {
        done(err);
      }
    } else {
      var should_update = docs.should_update.apply(null, res);
      if (should_update) {
        log.info(id, 'updating');
        docs.local.update.call(self, id, done);
      } else {
        log.info(id, 'skipping');
        done();
      }
    }
  });
}

// yep. that's it.
var destroy = docs.local.destroy;

function list (done) {
  var self = this;

  // use a queue to consume the changes feed
  var queue = async.queue(function (change, done) {
    if (change.deleted) {
      log.info(change.id, 'destroying');
      destroy.call(self, change.id, done);
    } else {
      log.info(change.id, 'inspecting');
      update.call(self, change.id, done);
    }
  });

  // get the changes feed, non-continuous
  nano(this.remote).changes(function (err, body) {
    if (err) {
      done(err);
    } else {
      // for each entry, add to a queue
      queue.push(body.results);
      // quit when the queue empties
      queue.drain = function () {
        log.info('finishing...');
        done();
      };
    }
  });
}

function watch (done) {
  var db = nano(this.remote);
  var self = this;

  function Watcher () {
    EventEmitter.call(this);
    var me = this;

    // directs changes appropriately
    function change_handler (change, done) {
      if (change.deleted) {
        me.emit('destroy', change.id);
        destroy.call(self, change.id, done);
      } else {
        me.emit('update', change.id);
        update.call(self, change.id, done);
      }
    }

    // use a queue to process changes
    this.queue = async.queue(change_handler);

    // begin listening :O
    this.feed = db.follow();
    this.feed.on('change', this.queue.push);
    this.feed.follow();

    return this;
  }

  inherits(Watcher, EventEmitter);

  // quit
  Watcher.prototype.close = function (done) {
    log.info('finishing...');
    // stop listening
    this.feed.stop();
    // quit when the queue is drained
    if (this.queue.length()) {
      this.queue.drain = done;
    } else {
      done();
    }
  };

  // return watcher
  var watcher = new Watcher();
  done(watcher);
}

module.exports = {
  update: update,
  destroy: destroy,
  list: list,
  watch: watch
};