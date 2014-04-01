var assert = require('assert');
var quilter = require('../../src-cov');
var fs = require('fs');
var async = require('async');
var request = require('request');
var path = require('path');
var async = require('async');

describe('pull', function () {
  beforeEach(function (done) {
    this.mount = './derp';
    this.remote = 'http://localhost:5984/quilt_test';
    this.config_path = './derp_config.json';

    async.series([
      // create the local folder
      fs.mkdir.bind(fs, this.mount),
      // create the remote db
      request.bind(request, {
        method: 'PUT',
        url: this.remote
      }),
      // put a doc into the remote
      request.bind(request, {
        method: 'POST',
        url: this.remote,
        json: {
          _id: 'test.md',
          hash: 'whatever man just whatever',
          _attachments: {
            file: {
              content_type: 'text/plain',
              data: new Buffer('# hello world').toString('base64')
            }
          }
        }
      })
    ], done);
  });

  describe('update and destroy', function () {
    // update a local file based on a remote doc
    it('should insert a doc', function (done) {
      var self = this;
      quilter.pull.update.call(this, 'test.md', function (err) {
        assert(!err);
        fs.exists(path.join(self.mount, 'test.md'), function (exists) {
          assert(exists);
          done();
        });
      });
    });

    // update a file that already exists
    it('should update a doc', function (done) {
      var self = this;
      async.series([
        // update the doc on the remote
        async.waterfall.bind(async, [
          request.get.bind(request, [this.remote, 'test.md'].join('/')),
          function (res, doc, done) {
            doc = JSON.parse(doc);
            doc._attachments = {};
            doc._attachments.file = {
              content_type: 'text/plain',
              data: new Buffer('# good bye').toString('base64')
            };
            done(null, doc);
          },
          function (doc, done) {
            request({
              method: 'PUT',
              uri: [self.remote, 'test.md'].join('/'),
              json: doc
            }, done);
          }
        ]),
        // pull that change to the local
        quilter.pull.update.bind(this, 'test.md')
      ], function (err) {
        fs.readFile(path.join(self.mount, 'test.md'), function (err, buffer) {
          assert(!err);
          assert.equal(buffer.toString(), '# good bye');
          done();
        });
      });
      
    });

    // delete a local file based on a remote doc
    it('should delete a doc', function (done) {
      var self = this;
      async.series([
        fs.writeFile.bind(fs, path.join(this.mount, 'test.md'), '# hello world'),
        quilter.pull.destroy.bind(this, 'test.md')
      ], function (err) {
        assert(!err);

        fs.exists(path.join(self.mount, 'test.md'), function (exists) {
          assert(!exists);
          done();
        });
      });
    });
  });

  describe('list', function () {
    it('should sync the state of the remote and local', function (done) {
      var self = this;
      async.series([
        fs.writeFile.bind(fs, path.join(this.mount, 'test.md'), '# hello world'),
        quilter.pull.list.bind(this)
      ], function (err) {
        assert(!err);

        fs.exists(path.join(self.mount, 'test.md'), function (exists) {
          assert(exists);
          done();
        });
      });
    });
  });

  describe('watch', function () {
    // pull changes from the remote to the local dir indefinitely
    it('should sync the state of the remote and local', function (done) {
      var self = this;
      var saw_update = false;
      async.waterfall([
        function (done) {
          quilter.pull.watch.call(self, function (watcher) {
            done(null, watcher);
          });
        },
        function (watcher, done) {
          watcher.on('update', function (id) {
            saw_update = id;
          });

          setTimeout(function () {
            done(null, watcher);
          }, 50);
        }
      ], function (err, watcher) {
        assert(!err);
        assert.equal(saw_update, 'test.md');

        // ensure the reported file exists
        fs.exists(path.join(self.mount, 'test.md'), function (exists) {
          assert(exists);

          watcher.close(done);
        });
      });
    });
  });

  afterEach(function (done) {
    async.series([
      request.bind(request, {
        url: this.remote,
        method: 'DELETE'
      }),
      quilter.util.rmdir.bind(null, this.mount)
    ], function (err) {
      done(err);
    });
  });
});
