var assert = require('assert');
var quilter = require('../../src-cov');
var fs = require('fs');
var async = require('async');
var request = require('request');
var path = require('path');

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
          request.bind({
            method: 'GET',
            url: [this.remote, 'test.md'].join('/')
          }),
          function (doc, done) {
            doc._attachments.file = {
              content_type: 'text/plain',
              data: new Buffer('# good bye').toString('base64')
            };
            done(null, doc);
          },
          function (doc, done) {
            request({
              method: 'PUT',
              url: [self.remote, 'test.md'].join('/'),
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
      quilter.pull.destroy.call(this, 'test.md', function (err) {
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
      quilter.pull.list.call(this, function (err) {
        assert(!err);
        fs.exists(path.join(self.mount, 'test.md'), function (exists) {
          assert(exists);
          done();
        });
      });
    });

    after(function (done) {
      fs.unlink(path.join(this.mount, 'test.md'), done);
    });
  });

  describe('watch', function () {
    // pull changes from the remote to the local dir indefinitely
    it('should sync the state of the remote and local', function (done) {
      var self = this;
      // begin watching
      quilter.pull.watch.call(this, function (watcher) {
        // when the watcher reports an update
        watcher.on('update', function (id) {
          // demonstrating the interface...
          assert.equal(id, 'test.md');
          // ensure the reported file exists
          fs.exists(path.join(self.mount, 'test.md'), function (exists) {
            assert(exists);
            watcher.close();
            done();
          });
        });
      });
    });

    after(function (done) {
      fs.unlink(path.join(this.mount, 'test.md'), done);
    });
  });

  afterEach(function (done) {
    async.series([
      request.bind(request, {
        url: this.remote,
        method: 'DELETE'
      }),
      quilter.util.rmdir.bind(null, this.mount)
    ], done);
  });
});
