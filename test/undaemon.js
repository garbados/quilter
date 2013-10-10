var assert = require('assert'),
    fixtures = require('./fixtures'),
    undaemon = require('../index').undaemon;

describe('undaemon', function () {
  describe('good opts', function () {
    var options = fixtures.options.good;
    it('should succeed if both arguments are present and valid', function () {
      undaemon(options.mount, options.remote);
    });
    it('should succeed if either argument is not present', function () {
      undaemon(options.mount, undefined);
      undaemon(undefined, options.remote);
      undaemon(undefined, undefined);
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad;
    it('should fail if both arguments are not valid', function () {
      try {
        undaemon(options.mount, options.remote);
      } catch (e) {}
    });
    it('should fail if remote is not valid', function () {
      try {
        undaemon(undefined, options.remote);
      } catch (e) {}
    });
    it('should fail if mount is not valid', function () {
      try {
        undaemon(options.mount, undefined);
      } catch (e) {}
    });
  });
});