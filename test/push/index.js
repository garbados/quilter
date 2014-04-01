var assert = require('assert');
var quilter = require('../../src-cov');
var fs = require('fs');
var async = require('async');
var request = require('request');
var path = require('path');

describe('push', function () {
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
      // put a doc locally
      fs.writeFile.bind(fs, path.join(this.mount, 'test.md'), '# hello world')
    ], done);
  });

  describe('update and destroy', function () {
    // update a local file based on a remote doc
    it('should insert a doc', function (done) {
      var self = this;
      quilter.push.update.call(this, 'test.md', function (err) {
        assert(!err);
        // ensure doc exists on the remote
        request.get([self.remote, 'test.md'].join('/'), function (err) {
          assert(!err);
          done();
        });
      });
    });

    // update a file that already exists
    it('should update a doc', function (done) {
      var self = this;
      async.series([
        // update the doc locally
        fs.writeFile.bind(fs, path.join(this.mount, 'test.md'), '# good bye'),
        // push that change to the remote
        quilter.push.update.bind(this, 'test.md')
      ], function (err) {
        // ensure it updated on the remote
        request.get([self.mount, 'test.md', 'file'].join('/'), function (err, body) {
          assert(!err);
          assert.equal(body, '# good bye');
          done();
        });
      });
    });

    // delete a local file based on a remote doc
    it('should delete a doc', function (done) {
      var self = this;
      quilter.push.destroy.call(this, 'test.md', function (err) {
        assert(!err);
        // ensure doc is deleted on remote
        request.get([self.mount, 'test.md'].join('/'), function (err) {
          assert.equal(err.status_code, 404);
          done();
        });
      });
    });
  });

  describe('list', function () {
    it('should sync the state of the remote and local', function (done) {
      var self = this;
      quilter.push.list.call(this, function (err) {
        assert(!err);
        // ensure the synced file exists on the remote
        request.get([self.mount, 'test.md'].join('/'), function (err) {
          assert(!err);
          done();
        });
      });
    });
  });

  describe('watch', function () {
    // pull changes from the remote to the local dir indefinitely
    it('should sync the state of the remote and local', function (done) {
      var self = this;
      // begin watching
      quilter.push.watch.call(this, function (watcher) {
        // when the watcher reports an update
        watcher.on('update', function (id) {
          // demonstrating the interface...
          assert.equal(id, 'test.md');
          // TODO ensure the reported file exists
          request.get([self.mount, 'test.md'].join('/'), function (err) {
            assert(!err);
            watcher.close(done);
          });
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
    ], done);
  });
});
