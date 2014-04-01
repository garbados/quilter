var quilter = require('../../src-cov');
var request = require('request');
var fs = require('fs');
var async = require('async');
var assert = require('assert');

describe('docs local', function() {
  before(function (done) {
    this.remote = 'http://localhost:5984/quilt_test';
    this.mount = './derp';
    this.doc_id = 'test.md';

    async.parallel([
      fs.mkdir.bind(fs, this.mount),
      async.series.bind(async, [
        request.bind(request, {
          url: this.remote,
          method: 'PUT'
        }),
        request.bind(request, {
          url: this.remote,
          method: 'POST',
          json: {
            _id: this.doc_id,
            hash: 'whatever man just whatever',
            _attachments: {
              file: {
                content_type: 'text/plain',
                data: new Buffer('# hello world').toString('base64')
              }
            }
          }
        })
      ])
    ], done);
  });

  it('should update local files based on remote docs', function (done) {
    var self = this;
    // update the local file based on the remote doc
    quilter.docs.local.update.call(this, this.doc_id, function (err) {
      assert(!err);
      var fp = quilter.util.file.path.call(self, self.doc_id);
      // check that it exists
      fs.exists(fp, function (exists) {
        assert(exists);
        done();
      });
    });
  });

  it('should retrieve local files', function (done) {
    quilter.docs.local.get.call(this, this.doc_id, function (err, doc) {
      assert(!err);
      assert(doc);
      done();
    });
  });

  it('should delete local files', function (done) {
    async.series([
      // destroy the file
      quilter.docs.local.destroy.bind(this, this.doc_id),
      // check whether it exists; will pass on as error if true
      fs.exists.bind(fs, quilter.util.file.path.call(this, this.doc_id))
    ], function (err) {
      assert(!err);
      done();
    });
  });

  after(function (done) {
    fs.rmdir(this.mount, done);
  });
});