var assert = require('assert'),
    fixtures = require('./fixtures'),
    init = require('../index').init;

describe('init', function () {
  describe('good opts', function () {
    var options = fixtures.options.good;
    it('should succeed with good options', function () {
      init(options.mount, options.remote);
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad;
    it('should fail if mount is missing', function () {
      try {
        init(undefined, options.remote); 
      } catch (e) {}
    });
    it('should fail if remote is missing', function () {
      try {
        init(options.mount, undefined); 
      } catch (e) {}
    });
    it('should fail if both args are missing', function () {
      try {
        init(undefined, undefined); 
      } catch (e) {}
    });
  });
});