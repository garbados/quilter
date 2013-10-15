var assert = require('assert'),
    fixtures = require('./fixtures'),
    spawn = require('child_process').spawn;

describe('undaemon', function () {
  describe('good opts', function () {
    beforeEach(function() {
      var options = fixtures.options.good,
          cmd = fixtures.getCmd('daemon', options);

      this.child = spawn(cmd.cmd, cmd.args);
    });

    afterEach(function() {
      this.child.kill();
    })
    it('should succeed with good options', function () {
      var errors = [];
      
      this.child.stderr.on('data', function (data) {
        errors.push(data);
      });

      this.child.on('close', function () {
        assert(!errors.length, "Got errors >:(");
      });
    });
  });
  describe('bad opts', function () {
    beforeEach(function() {
      var options = fixtures.options.bad,
          cmd = fixtures.getCmd('daemon', options);
      
      this.child = spawn(cmd.cmd, cmd.args);
    });

    it('should fail', function () {
      var errors = [];
      this.child.stderr.on('data', function (data) {
        errors.push(data);
      });
      this.child.on('close', function () {
        assert(errors.length, "Did not throw an error >:(");
      })
    });
  });
});