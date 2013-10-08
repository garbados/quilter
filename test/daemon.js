var assert = require('assert'),
    fixtures = require('./fixtures'),
    daemon = require('../tasks/daemon');

describe('daemon', function () {
  describe('good opts', function () {
    daemon(fixtures.mount, fixtures.remote);
  });
  describe('bad opts', function () {
    it('should fail if mount is missing', function () {
      try {
        daemon(undefined, fixtures.remote); 
      } catch (e) {}
    });
    it('should fail if remote is missing', function () {
      try {
        daemon(fixtures.mount, undefined); 
      } catch (e) {}
    });
    it('should fail if both args are missing', function () {
      try {
        daemon(undefined, undefined); 
      } catch (e) {}
    });
  });
});