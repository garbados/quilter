var assert = require('assert');
var quilter = require('../../src-cov');
var async = require('async');
var fs = require('fs');

describe('config utils', function () {
  before(function () {
    this.config_path = './config_test.json';
  });

  it('should return a config even if it doesn\'t exist', function (done) {
    var self = this;
    fs.exists(this.config_path, function (exists) {
      // config shouldn't exist
      assert(!exists);
      quilter.util.config.get.call(self, function (err, config) {
        if (err) throw err;
        // but we should still get an empty array
        assert.equal(config.length, 0);
        done();
      });
    });
  });

  it('should obscure passwords when printing', function (done) {
    var job = {
      remote: 'http://username:password@localhost:5984/savetest',
      local: '.test3',
      command: 'push',
      watch: true,
      config: '.testconfig.json'
    };

    async.series([
      quilter.util.config.add.bind(this, job),
      quilter.util.config.print.bind(this)
    ], function (err, res) {
      assert(!err);
      var str = res[1];
      assert.equal(str.indexOf(':password@'), -1);
      done();
    });
  })

  it('should create and overwrite configs', function (done) {
    var self = this;

    async.series([
      quilter.util.config.set.bind(this, [{ hello: 'world' }]),
      function (done) {
        quilter.util.config.get.call(self, function (err, config) {
          if (err) {
            done(err);
          } else {
            assert.equal(config.length, 1);
            done(); 
          }
        });
      },
      quilter.util.config.set.bind(this, [{ good: 'bye' }]),
      function (done) {
        quilter.util.config.get.call(self, function (err, config) {
          if (err) {
            done(err);
          } else {
            assert.equal(config[0].good, 'bye');
            done(); 
          }
        });
      },
      function (done) {
        fs.unlink(self.config_path, done);
      }
    ], done);
  });

  it('should add jobs without overwriting', function (done) {
    var self = this;

    async.series([
      // add one job
      quilter.util.config.add.bind(this, { hello: 'world' }),
      // add two jobs
      quilter.util.config.add.bind(this, [{
        how: 'are you?'
      }, {
        good: 'bye'
      }]),
      function (done) {
        quilter.util.config.get.call(self, function (err, config) {
          if (err) {
            done(err);
          } else {
            assert.equal(config.length, 3);
            done(); 
          }
        });
      },
      function (done) {
        fs.unlink(self.config_path, done);
      }
    ], done);
  });
});