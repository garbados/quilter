var util = require('../util');
var nano = require('nano');
var fs = require('fs');
var async = require('async');
var local = require('./local');

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

  function format_doc (buffer, doc) {
    doc._attachments = {};
    doc._attachments.file = {
      content_type: util.file.type.call(this, id),
      data: buffer.toString('base64')
    };

    return doc;
  }

  async.parallel([
    fs.readFile.bind(fs, fp),
    db.get.bind(db, id)
  ], function (err, res) {
    var buffer;
    if (err) {
      if (err.status_code === 404) {
        buffer = res[0];
        local.get.call(self, id, function (err, doc) {
          if (err) return done(err);
          
          doc = format_doc.call(self, buffer, doc);
          db.insert(doc, done);
        });
      } else return done(err);
    } else {
      buffer = res[0];
      var doc = res[1][0];

      doc = format_doc.call(self, buffer, doc);
      db.insert(doc, done);
    }
  });
}

// destroy a remote doc
function destroy (id, done) {
  var db = nano(this.remote);
  async.waterfall([
    db.get.bind(db, id),
    function (doc, headers, done) {
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