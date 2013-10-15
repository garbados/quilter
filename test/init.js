var assert = require('assert'),
    fixtures = require('./fixtures'),
    Quilt = require('../lib').Quilt;

describe('Quilt', function () {
  describe('good opts', function () {
    var options = fixtures.options.good;
    it('should succeed with good options', function () {
      Quilt(options.mount, options.remote).start();
    });
  });
  describe('bad opts', function () {
    var options = fixtures.options.bad;
    it('should fail if mount is missing', function () {
      try {
        Quilt(undefined, options.remote).start(); 
      } catch (e) {}
    });
    it('should fail if remote is missing', function () {
      try {
        Quilt(options.mount, undefined).start(); 
      } catch (e) {}
    });
    it('should fail if both args are missing', function () {
      try {
        Quilt(undefined, undefined).start(); 
      } catch (e) {}
    });
  });
});