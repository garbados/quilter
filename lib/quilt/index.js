var async = require('async'),
    Mounter = require('./mount'),
    Remotist = require('./remote'),
    Pusher = require('./push'),
    Puller = require('./pull'),
    mkdb = require('./mkdb'),
    util = require('./util');

function Quilt (mount, remote) {
  mount = util.resolvePath(mount);
  var mount_queue = Pusher(mount, remote),
      remote_queue = Puller(mount, remote),
      mount_worker = Mounter(mount, mount_queue),
      remote_worker = Remotist(remote, remote_queue);

  // sync remote files with local mountpoint
  // and vice versa, then callback
  function sync (done) {
    async.series([
      mount_worker.list, 
      remote_worker.list
    ], done);
  }

  // keep remote and mount in sync
  // runs forever, or tries to
  function watch () {
    mount_worker.watch();
    remote_worker.watch();
  }

  // first, make sure remote exists
  // then syncs
  // then starts watching
  function start () {
    mkdb(remote)(function () {
      sync(watch);
    });
  }

  return {
    sync: sync,
    watch: watch,
    start: start
  };
}

module.exports = Quilt;
