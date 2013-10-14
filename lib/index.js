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
  // ensure remote exists
  // then, begin watching
  async.series([
    mkdb(remote),
    mount_worker.list, 
    remote_worker.list
  ], function (err) {
    console.log('Begin quilting...');
    mount_worker.watch();
    remote_worker.watch();
  });
}

module.exports = Quilt;
