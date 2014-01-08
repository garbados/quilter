var nano = require('nano'),
    url = require('url');

exports.mkdb = function (job, done) {
  var remote = job.target;
  var parts = url.parse(remote),
      instance_url = parts.auth ? 
        parts.protocol + '//' + parts.auth + "@" + parts.host 
        : 
        parts.protocol + '//' + parts.host
        ;
      instance = nano(instance_url),
      dbname = parts.pathname.replace(/^\//, '');

  instance.db.create(dbname, function (err, res) {
    if (err && err.status_code !== 412) {
      throw err;
    } else {
      done();
    }
  });
};