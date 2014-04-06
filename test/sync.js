// TODO
// sync testing
var assert = require('assert');
var async = require('async');
var fs = require('fs');
var request = require('request');
var quilter = require('../src-cov');


describe('sync', function() {
  before(function () {
    this.config_path = './config_test.json';
    this.mount = './derp';
    this.remote = 'http://localhost:5984/quilt_test';
    this.quilt = quilter.init({
      config_path: this.config_path,
      mount: this.mount,
      remote: this.remote
    });
  });

  beforeEach(function (done) {
    async.parallel([
      async.series.bind(async, [
        fs.mkdir.bind(fs, this.mount),
        fs.writeFile.bind(fs, this.quilt.util.file.path('test.md'), '# hello world')
      ]),
      async.series.bind(async, [
        request.put.bind(request, this.remote),
        request.bind(request, {
          method: 'POST',
          url: this.remote,
          json: {
            _id: 'other.md',
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

  afterEach(function (done) {
    async.parallel([
      quilter.util.rmdir.bind(null, this.mount),
      request.del.bind(request, this.remote)
    ], done);
  });

  describe('list', function() {
    it('should sync local and remote state', function (done) {
      var self = this;
      this.quilt.sync.list(function (err) {
        assert(!err);

        async.parallel([
          function (done) {
            fs.exists(self.quilt.util.file.path('other.md'), function (exists) {
              assert(exists);
              done();
            });
          },
          function (done) {
            request.get([self.remote, 'test.md'].join('/'), function (err, res, body) {
              assert(!err);
              assert.equal(res.statusCode, 200);
              done();
            });
          }
        ], done);
      });
    });
  });

  describe('watch', function() {
    this.timeout(7000);
    it('should sync local and remote state', function (done) {
      var self = this;
   
      async.series([
        function (done) { self.quilt.sync.watch(done.bind(null, null)); },
        fs.writeFile.bind(fs, quilter.util.file.path.call(this, 'test.md'), '# good bye')
      ], function (err, res) {
        assert(!err);
        var watcher = res[0];

        async.series([
          function (done) {
            setTimeout(done, 6000);
          },
          async.parallel.bind(async, [
            function (done) {
              fs.exists(self.quilt.util.file.path('other.md'), function (exists) {
                assert(exists);
                done();
              });
            },
            function (done) {
              request.get([self.remote, 'test.md'].join('/'), function (err, res, body) {
                assert(!err);
                assert.equal(res.statusCode, 200);
                done();
              });
            }
          ]),
          watcher.close
        ], done);
      });
    })
  });
});