var assert = require('assert'),
    fixtures = require('./fixtures'),
    init = require('../tasks/init');

describe('init', function () {
  describe('good opts', function () {
    init(fixtures.mount, fixtures.remote);
  });
  describe('bad opts', function () {
    it('should fail if mount is missing', function () {
      try {
        init(undefined, fixtures.remote); 
      } catch (e) {}
    });
    it('should fail if remote is missing', function () {
      try {
        init(fixtures.mount, undefined); 
      } catch (e) {}
    });
    it('should fail if both args are missing', function () {
      try {
        init(undefined, undefined); 
      } catch (e) {}
    });
  });
});