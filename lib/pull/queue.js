/* Manages remote directory
 * Pushes changes to remote worker
 */

var nano = require('nano'),
    async = require('async'),
    util = require('../util');

module.exports = function (job, done) {
  var remote = job.target;
  var worker = require('./worker')(job);
  var db = nano(remote);

  function list (done) {
    db.list({
      include_docs: true
    }, function (err, body) {
      if (err) {
        throw err;
      } else {
        async.each(body.rows, function (row, cb) {
          if (row.id.indexOf('_design') === 0) {
            cb();
          } else {
            worker.update.push({
              id: row.id,
              hash: row.doc.hash,
              timestamp: row.doc.timestamp
            }, cb); 
          }
        }, done);
      }
    });
  }

  function watch (done) {
    var feed = db.follow({
      since: 'now',
      include_docs: true
    });
    feed.on('error', done); // TODO verify this works
    feed.on('change', function (change) {
      if (change.id.indexOf('_design') === 0) {
        // do nothing :O
      } else if (change.deleted) {
        worker.destroy.push({ 
          id: change.id,
          timestamp: Infinity
        });
      } else {
        worker.update.push({
          id: change.id,
          hash: change.doc.hash,
          timestamp: change.doc.timestamp
        });
      }
    });
    feed.follow();
  }

  var tasks = [util.mkdb.bind(util, job), list];
  if (job.watch) tasks.push(watch);
  async.series(tasks, done);
};