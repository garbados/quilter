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
    describe('list', function() {
      // TODO
    });

    describe('watch', function() {
      // TODO
    });
  });

  describe('pull', function() {
    describe('list', function() {
      // TODO
    });

    describe('watch', function() {
      // TODO
    });
  });

  describe('sync', function() {
    describe('list', function() {
      // TODO
    });

    describe('watch', function() {
      // TODO
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
      fs.unlink(this.config_path, done)
    });
  });
})