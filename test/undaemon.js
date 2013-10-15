var assert = require('assert'),
    fixtures = require('./fixtures'),
    undaemon = require('../lib').Daemon.destroy;

describe('undaemon', function () {
  describe('good opts', function () {
    var options = fixtures.options.good;
    it('should succeed with good options', function () {
      undaemon(options.mount, options.remote);
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad;
    it('should fail if mount is missing', function () {
      try {
        undaemon(undefined, options.remote); 
      } catch (e) {}
    });
    it('should fail if remote is missing', function () {
      try {
        undaemon(options.mount, undefined); 
      } catch (e) {}
    });
    it('should fail if both args are missing', function () {
      try {
        undaemon(undefined, undefined); 
      } catch (e) {}
    });
  });
});