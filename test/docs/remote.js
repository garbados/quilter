var quilter = require('../../src-cov');
var request = require('request');
var fs = require('fs');
var async = require('async');
var assert = require('assert');
var path = require('path');

describe('docs remote', function() {
  before(function (done) {
    this.remote = 'http://localhost:5984/quilt_test';
    this.mount = './derp';
    this.doc_id = 'test.md';

    async.parallel([
      async.series.bind(async, [
        fs.mkdir.bind(fs, this.mount),
        fs.writeFile.bind(fs, path.join(this.mount, this.doc_id), '# hello world')
      ]),
      request.bind(request, {
        url: this.remote,
        method: 'PUT'
      })
    ], done);
  });

  it('should update remote docs based on local files', function (done) {
    var self = this;
    // update the local file based on the remote doc
    quilter.docs.remote.update.call(this, this.doc_id, function (err) {
      assert(!err);
      var fp = quilter.util.file.path.call(self, self.doc_id);
      // check that it exists
      request.get([self.remote, self.doc_id].join('/'), function (err, res, body) {
        assert(!err);
        assert.equal(JSON.parse(body)._id, self.doc_id);
        done();
      });
    });
  });

  it('should retrieve remote docs', function (done) {
    var self = this;
    quilter.docs.remote.get.call(this, this.doc_id, function (err, doc) {
      assert(!err);
      assert.equal(doc._id, self.doc_id);
      done();
    });
  });

  it('should delete local files', function (done) {
    var self = this;
    quilter.docs.remote.destroy.call(this, this.doc_id, function (err) {
      assert(!err);
      request.get([self.remote, self.doc_id].join('/'), function (err, res, body) {
        assert.equal(res.statusCode, 404);
        done();
      });
    });
  });

  after(function (done) {
    async.series([
      quilter.util.rmdir.bind(this, this.mount),
      request.del.bind(request, this.remote)
    ], done);
  });
});