/* Manages remote directory
 * Pushes changes to remote queue
 */

var nano = require('nano'),
    async = require('async');

module.exports = function (remote, queue) {
  var db = nano(remote);

  function list (done) {
    db.list({
      include_docs: true
    }, function (err, body) {
      if (err) {
        throw err;
      } else {
        async.map(body.rows, function (row, cb) {
          queue.update.push({
            id: row.id,
            hash: row.doc.hash,
            timestamp: row.doc.timestamp
          }, cb);
        }, done);
      }
    });
  }

  function watch () {
    var feed = db.follow({
      since: 'now',
      include_docs: true
    });
    feed.on('change', function (change) {
      if (change.deleted) {
        queue.destroy.push({ 
          id: change.id,
          timestamp: Infinity
        });
      } else {
        queue.update.push({
          id: change.id,
          hash: change.doc.hash,
          timestamp: change.doc.timestamp
        });
      }
    });
    feed.follow();
  }

  return {
    list: list,
    watch: watch
  };
};