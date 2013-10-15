var assert = require('assert'),
    fixtures = require('./fixtures'),
    spawn = require('child_process').spawn,
    nano = require('nano');

describe('Quilt', function () {
  describe('good opts', function () {
    beforeEach(function() {
      var options = fixtures.options.good;
      var cmd = fixtures.getCmd('init', options);
      this.db = nano(options.remote);
      this.child = spawn(cmd.cmd, cmd.args);
    });
    
    afterEach(function() {
      this.child.kill();
    });

    it('should sync `hello` with the server', function () {
      // give the child time to sync
      setTimeout(function () {
        this.db.get('hello', function (err, res) {
          if (err) throw err;
          if (res.status_code !== 200) throw new Error('could not find `hello`');
        });
      }, 3000);
    });

    it('should not error out', function () {
      this.child.stderr.on('data', function (data) {
        console.log(data.toString());
        throw new Error('Threw error >:(');
      });
    });
  });
  describe('bad opts', function () {
    beforeEach(function() {
      var options = fixtures.options.bad,
          cmd = fixtures.getCmd('init', options);

      this.child = spawn(cmd.cmd, cmd.args);
    });

    it('should fail', function () {
      var errors = [];
      
      this.child.stderr.on('data', function (data) {
        errors.push(data);
      });
      
      this.child.on('close', function () {
        assert(errors.length, "Didn't throw errors >:(");
      });
    });
  });
});