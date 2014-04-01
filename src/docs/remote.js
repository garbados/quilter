var util = require('../util');
var nano = require('nano');
var fs = require('fs');
var async = require('async');

// retrieve the remote doc
function get (id, done) {
  var db = nano(this.remote);
  db.get(id, done);
}

// update a remote doc
// based on a local file
function update (id, done) {
  var fp = util.file.path.call(this, id);
  var db = nano(this.remote);
  var self = this;

  async.parallel([
    fs.readFile.bind(fs, fp),
    db.get.bind(db, id)
  ], function (err, res) {
    if (err) return done(err);

    var buffer = res[0];
    var doc = res[1];

    doc._attachments = {};
    doc._attachments.file = {
      content_type: util.file.type.call(self, id),
      data: buffer.toString('base64')
    };

    db.insert(doc, done);
  });
}

// destroy a remote doc
function destroy (id, done) {
  var db = nano(this.remote);
  async.waterfall([
    db.get.bind(db, id),
    function (doc, done) {
      done(null, doc._id, doc._rev);
    },
    db.destroy
  ], done);
}

module.exports = {
  get: get,
  update: update,
  destroy: destroy
};