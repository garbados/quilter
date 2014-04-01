var util = require('../util');
var nano = require('nano');
var fs = require('fs');
var async = require('async');
var path = require('path');

// get a doc-like version of a local file
// returning id, timestamp, and hash
function get (id, done) {
  var fp = util.file.path.call(this, id);
  async.parallel([
    fs.stat.bind(fs, fp),
    util.hash.bind(this, fp)
  ], function (err, res) {
    if (err) return done(err);

    var stat = res[0];
    var timestamp = stat ? new Date(stat.mtime).getTime() : 0;
    var buffer = res[1];
    var hash = res[2];

    done(null, {
      _id: id,
      timestamp: timestamp,
      hash: hash
    });
  });
}

// update a local file 
// based on the equivalent remote doc
function update (id, done) {
  var fp = util.file.path.call(this, id);
  var dirpath = path.dirname(fp);
  var self = this;
  // ensure the path to the file exists
  util.mkdir(dirpath, function (err) {
    if (err) return done(err);

    // stream the attachment contents into the file
    var stream = fs.createWriteStream(util.file.path.call(self, id));
    var attachment = nano(self.remote).attachment.get(id, 'file');
    attachment
      .on('error', done)
      .on('end', done)
      .pipe(stream);
  });
}

// destroy a local file
function destroy (id, done) {
  var fp = util.file.path.call(this, id);
  fs.unlink(fp, done);
}

module.exports = {
  get: get,
  update: update,
  destroy: destroy
};