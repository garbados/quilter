// end to end testing
var assert = require('assert');
var async = require('async');
var fs = require('fs');
var request = require('request');
var quilter = require('../../src-cov');

describe('quilt', function() {
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
      fs.mkdir.bind(fs, this.mount),
      request.put.bind(request, this.remote)
    ], done);
  });

  afterEach(function (done) {
    async.parallel([
      quilter.util.rmdir.bind(null, this.mount),
      request.del.bind(request, this.remote)
    ], done);
  });

  describe('push', function() {
    beforeEach(function (done) {
      // add a file to push
      fs.writeFile(this.quilt.util.file.path('test.md'), '# hello world', done);
    });

    describe('list', function() {
      it('should push local state to the remote', function (done) {
        var self = this;
        async.waterfall([
          quilter.jobs.get.bind(null, 'push', {
            remote: this.remote,
            mount: this.mount,
            config_path: this.config_path
          }),
          function (func, done) {
            func(done);
          }
        ], function (err) {
          assert(!err);
          self.quilt.docs.remote.get('test.md', function (err, doc) {
            assert(!err);
            assert(doc);
            done();
          });
        });
      });
    });

    describe('watch', function() {
      this.timeout(7000);
      it('should push local state to the remote', function (done) {
        var self = this;
     
        async.series([
          function (done) {
            quilter.jobs.get('push', {
              remote: self.remote,
              mount: self.mount,
              config_path: self.config_path,
              watch: true
            }, function (err, func) {
              func(function (watcher) {
                done(null, watcher);
              });
            });
          },
          function (done) {
            setTimeout(done, 6000);
          },
          self.quilt.docs.remote.get.bind(self.quilt, 'test.md')
        ], function (err, res) {
          assert(!err);

          var watcher = res[0];
          watcher.close(done);
        });
      });
    });
  });

  describe('pull', function() {
    beforeEach(function (done) {
      request({
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
      }, done);
    });

    describe('list', function() {
      it('should pull remote state to the local', function (done) {
        var self = this;
        async.waterfall([
          quilter.jobs.get.bind(null, 'pull', {
            remote: this.remote,
            mount: this.mount,
            config_path: this.config_path
          }),
          function (func, done) {
            func(done);
          }
        ], function (err) {
          assert(!err);
          self.quilt.docs.local.get('test.md', function (err, doc) {
            assert(!err);
            assert(doc);
            done();
          });
        });
      });
    });

    describe('watch', function() {
      it('should pull remote state to the local', function (done) {
        var self = this;
        var saw_update = false;
        async.waterfall([
          quilter.jobs.get.bind(null, 'pull', {
            remote: this.remote,
            mount: this.mount,
            config_path: this.config_path,
            watch: true
          }),
          function (func, done) {
            func(function (watcher) {
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
          fs.exists(self.quilt.util.file.path('test.md'), function (exists) {
            assert(exists);

            watcher.close(done);
          });
        });
      });
    });
  });

  describe('sync', function() {
    beforeEach(function (done) {
      async.parallel([
        fs.writeFile.bind(fs, this.quilt.util.file.path('other.md'), '# hello world'),
        request.bind(request, {
          method: 'POST',
          url: this.remote,
          json: {
            _id: 'test.md',
            hash: 'whatever man just whatever',
            _attachments: {
              file: {
                content_type: 'text/plain',
                data: new Buffer('# good bye').toString('base64')
              }
            }
          }
        })
      ], done);
    });

    describe('list', function() {
      it('should sync state between local and remote', function (done) {
        var self = this;
        async.waterfall([
          quilter.jobs.get.bind(null, 'sync', {
            remote: this.remote,
            mount: this.mount,
            config_path: this.config_path
          }),
          function (func, done) {
            func(done);
          }
        ], function (err) {
          assert(!err);
          async.parallel([
            self.quilt.docs.remote.get.bind(self.quilt, 'other.md'),
            self.quilt.docs.local.get.bind(self.quilt, 'test.md'),
          ], function (err) {
            assert(!err);
            done();
          });
        });
      });
    });

    describe('watch', function() {
      this.timeout(7000);
      it('should sync state between local and remote', function (done) {
        var self = this;
     
        async.series([
          function (done) {
            quilter.jobs.get('sync', {
              remote: self.remote,
              mount: self.mount,
              config_path: self.config_path,
              watch: true
            }, function (err, func) {
              func(function (watcher) {
                done(null, watcher);
              });
            });
          },
          function (done) {
            setTimeout(done, 6000);
          },
          async.parallel.bind(async, [
            self.quilt.docs.remote.get.bind(self.quilt, 'other.md'),
            self.quilt.docs.local.get.bind(self.quilt, 'test.md'),
          ])
        ], function (err, res) {
          assert(!err);

          var watcher = res[0];
          watcher.close(done);
        });
      });
    });
  });

  describe('save', function() {
    it('should save a command to the local config', function (done) {
      var self = this;
      async.waterfall([
        quilter.jobs.get.bind(null, 'push', {
          save: true,
          config_path: this.config_path
        }),
        function (func, done) {
          func(done);
        }
      ], function (err) {
        assert(!err);
        self.quilt.util.config.get(function (err, config) {
          assert(!err);
          assert.equal(config.length, 1);
          done();
        });
      });
    });

    after(function (done) {
      fs.unlink(this.config_path, done);
    });
  });

  describe('jobs', function() {
    before(function (done) {
      this.quilt.util.config.add({
        remote: 'http://username:password@localhost:5984/savetest',
        local: '.test3',
        command: 'push',
        watch: true
      }, done);
    });

    it('should print all saved jobs, obscuring passwords', function (done) {
      quilter.jobs.get('jobs', {
        config_path: this.config_path
      }, function (err, func) {
        assert(!err);
        func(function (err, str) {
          assert(!err);
          assert.equal(str.indexOf(':password@'), -1);
          done();
        });
      });
    });

    after(function (done) {
      fs.unlink(this.config_path, done);
    });
  })
})