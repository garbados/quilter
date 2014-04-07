var async = require('async');
var request = require('request');
var fs = require('fs');
var assert = require('assert');
var quilter = require('../src-cov');

describe('jobs', function () {
  before(function (done) {
    this.get = quilter.jobs.get;
    this.config_path = './config_test.json';
    this.remote = 'http://localhost:5984/quilt_test';
    this.mount = './derp';
    this.quilt = quilter.init({
      mount: this.mount,
      remote: this.remote,
      config_path: this.config_path
    });

    async.parallel([
      fs.mkdir.bind(fs, this.mount),
      request.put.bind(request, this.remote)
    ], done);
  });

  afterEach(function (done) {
    this.quilt.util.config.set([], done);
  });

  after(function (done) {
    async.parallel([
      fs.unlink.bind(fs, this.config_path),
      fs.rmdir.bind(fs, this.mount),
      request.del.bind(request, this.remote)
    ], done);
  });

  it('without a command, should execute all saved commands', function (done) {
    var self = this;
    this.quilt.util.config.add({
      mount: this.mount,
      remote: this.remote,
      command: 'push'
    }, function (err) {
      assert(!err);
      self.get(undefined, {
        config_path: self.config_path
      }, function (err, func) {
        assert(!err);
        func(done);
      })
    });
  });

  it('should save a job but not execute it', function (done) {
    var self = this;
    this.get('push', {
      save: true,
      config_path: this.config_path
    }, function (err, func) {
      assert(!err);
      func(function (err) {
        assert(!err);
        self.quilt.util.config.get(function (err, config) {
          assert(!err);
          assert.equal(config.length, 1);
          done();
        });
      });
    });
  });

  it('should execute a given command', function (done) {
    var self = this;
    this.get('push', {
      config_path: this.config_path,
      remote: this.remote,
      mount: this.mount
    }, function (err, func) {
      assert(!err);
      func(done);
    });
  });
});