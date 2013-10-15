var assert = require('assert'),
    fixtures = require('./fixtures'),
    spawn = require('child_process').spawn,
    nano = require('nano');

describe('Quilt', function () {
  describe('good opts', function () {
    var options = fixtures.options.good,
        cmd = fixtures.getCmd('init', options),
        child = spawn(cmd),
        db = nano(options.remote);

    it('should sync `hello` with the server', function () {
      // give the child time to sync
      setTimeout(function () {
        db.get('hello', function (err, res) {
          if (err) throw err;
          if (res.status_code !== 200) throw new Error('could not find `hello`');
        });
      }, 3000);
    });

    it('should not error out', function () {
      child.stderr.on('data', function (data) {
        console.log(data.toString());
        throw new Error('Threw error >:(');
      });
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad,
        cmd = fixtures.getCmd('init', options),
        child = spawn(cmd);
    it('should fail', function () {
      var errors = [];
      
      child.stderr.on('data', function (data) {
        errors.push(data);
      });
      
      child.on('close', function () {
        assert(errors.length, "Didn't throw errors >:(");
      });
    });
  });
});