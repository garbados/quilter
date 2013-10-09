var nano = require('nano'),
    url = require('url');

module.exports = function (remote) {
  var parts = url.parse(remote),
      instance = nano(parts.protocol + '//' + parts.host),
      dbname = parts.pathname.replace(/^\//, '');

  return function (done) {
    instance.db.create(dbname, function (err, res) {
      if (err && err.status_code !== 412) {
        console.log(err);
        throw err;
      } else {
        done();
      }
    });
  };
};