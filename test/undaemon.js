var assert = require('assert'),
    fixtures = require('./fixtures');

describe('undaemon', function () {
  describe('good opts', function () {

    beforeEach(function() {
      var options = fixtures.options.good;

      this.child = fixtures.getChild('undaemon', options);
    });

    afterEach(function() {
      this.child.kill();
    });

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
      var options = fixtures.options.bad;

      this.child = fixtures.getChild('undaemon', options);
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