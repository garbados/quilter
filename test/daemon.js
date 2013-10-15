var assert = require('assert'),
    fixtures = require('./fixtures'),
    spawn = require('child_process').spawn;

describe('undaemon', function () {
  describe('good opts', function () {
    var options = fixtures.options.good,
        cmd = fixtures.getCmd('daemon', options),
        child = spawn(cmd);
    it('should succeed with good options', function () {
      var errors = [];
      
      child.stderr.on('data', function (data) {
        errors.push(data);
      });

      child.on('close', function () {
        assert(!errors.length, "Got errors >:(");
      });
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad,
        cmd = fixtures.getCmd('daemon', options),
        child = spawn(cmd);
    it('should fail', function () {
      var errors = [];
      child.stderr.on('data', function (data) {
        errors.push(data);
      });
      child.on('close', function () {
        assert(errors.length, "Did not throw an error >:(");
      })
    });
  });
});