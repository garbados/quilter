var watch = require('watch'),
    nano = require('nano'),
    async = require('async'),
    fs = require('fs'),
    path = require('path');
    dive = require('dive'),
    urls = require('url'),
    util = require('./util'),
    http = require('http');

http.globalAgent.maxSockets = 20;

function Quilt (mount, remote) {
  var mount = util.resolvePath(mount),
      db = nano(remote);

  function _pull (f, timestamp) {
    var filepath = path.join(mount, f);
    // pull from remote to local if timestamp > mtime
    fs.stat(filepath, function (err, stat) {
      if (err && err.code !== 'ENOENT') {
        throw err;
      }
      if ((err && err.code === 'ENOENT') || timestamp > stat.mtime) {
        util.mkdirParent(util.dirpath(filepath), function (err) {
          if (err && err.code !== 'EEXIST') throw err;
          db.attachment.get(f, 'file').pipe(fs.createWriteStream(filepath));
        });
      } else {
        _update(f, stat);
      }
    });
  }

  function _update (f, stat) {
    var filepath = path.join(mount, f),
        file_id = JSON.stringify(f.split(path.sep));
    db.get(file_id, function (err, doc) {
      if (err && err.status_code !== 404) {
        throw err;
      }

      doc = doc || {
        _id: file_id
      };
      
      if ((doc.timestamp < stat.mtime) || (doc.timestamp || stat.mtime)) {
        doc.timestamp = stat.mtime;

        db.insert(doc, function (err, body) {
          if (err) throw err;
          fs.readFile(filepath, function (err, buffer) {
            if (err) throw err;
            db.attachment.insert(file_id, 'file', buffer, util.filetype(f), {
              rev: body.rev
            }, cb);
          });
        });
      }
    });
  }

  function _delete (f) {
    db.head(f, function (err, _, headers) {
      var rev = headers.etag.replace(/"/g, '');

      db.attachment.destroy(f, 'file', rev, function (err) {
        if (err) {
          throw err;
        }
      });
    });
  }

  // pull any server-side changes to the local mountpoint
  // overwriting any files with a lower timestamp
  function pull (done) {
    db.list({
      include_docs: true
    }, function (err, body) {
      if (err) {
        throw err;
      } else {
        async.map(body.rows, function (row, cb) {
          var id = JSON.parse(row.id).join(path.sep);
          _pull(id, row.doc.timestamp);
          cb();
        }, done);
      }
    });
  }

  // push any local files to the remote
  // if their mtimes are higher
  function push (done) {
    dive(mount, function (err, f) {
      if (err) {
        throw err;
      }
      fs.stat(f, function (err, stat) {
        if (err) throw err;
        var filepath = f.slice(mount.length);
        _update(filepath, stat);
      });
    }, done);
  }

  // ensure that the remote exists
  function mkdb (done) {
    var parts = urls.parse(remote),
        dbname = parts.pathname.replace(/^\//, '');

    nano(parts.protocol + '//' + parts.host).db.create(dbname, function (err) {
      if (err && err.status_code !== 412) {
        throw err;
      } else {
        done();
      }
    });
  }

  // begin watching the mountpoint directory for changes
  function start () {
    watch.createMonitor(mount, function (monitor) {
      monitor.on('created', _update);
      monitor.on('changed', _update);
      monitor.on('removed', _delete);
    });
  }

  // sync remote files with local mountpoint
  // ensure remote exists
  // then, begin watching
  async.series([mkdb, pull, push, start], function (err) {
    // throw if series ends unexpectedly
    throw err;
  });
}

module.exports = Quilt;
