var assert = require('assert'),
    fixtures = require('./fixtures'),
    daemon = require('../index').daemon;

describe('daemon', function () {
  describe('good opts', function () {
    var options = fixtures.options.good;
    it('should succeed with good options', function () {
      daemon(options.mount, options.remote);
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad;
    it('should fail if mount is missing', function () {
      try {
        daemon(undefined, options.remote); 
      } catch (e) {}
    });
    it('should fail if remote is missing', function () {
      try {
        daemon(options.mount, undefined); 
      } catch (e) {}
    });
    it('should fail if both args are missing', function () {
      try {
        daemon(undefined, undefined); 
      } catch (e) {}
    });
  });
});