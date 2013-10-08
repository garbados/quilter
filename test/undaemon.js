var assert = require('assert'),
    fixtures = require('./fixtures'),
    undaemon = require('../tasks/undaemon');

describe('undaemon', function () {
  describe('good opts', function () {
    it('should succeed if both arguments are present and valid', function () {
      undaemon(fixtures.mount, fixtures.remote);
    });
    it('should succeed if either argument is not present', function () {
      undaemon(fixtures.mount, undefined);
      undaemon(undefined, fixtures.remote);
      undaemon(undefined, undefined);
    });
  });
  describe('bad opts', function () {
    it('should fail if both arguments are not valid', function () {
      try {
        undaemon(fixtures.bad_mount, fixtures.bad_remote);
      } catch (e) {}
    });
    it('should fail if remote is not valid', function () {
      try {
        undaemon(undefined, fixtures.bad_remote);
      } catch (e) {}
    });
    it('should fail if mount is not valid', function () {
      try {
        undaemon(fixtures.bad_mount, undefined);
      } catch (e) {}
    });
  });
});