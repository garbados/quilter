var assert = require('assert');
var quilter = require('../../src-cov');

describe('docs', function () {
  describe('should_update', function () {
    it('should reject identical hashes', function () {
      var should_update = quilter.docs.should_update({
        hash: 'hello'
      }, {
        hash: 'hello'
      });

      assert(!should_update);
    });

    it('should reject older timestamps', function() {
      var should_update = quilter.docs.should_update({
        hash: 'hello',
        timestamp: 1
      }, {
        hash: 'goodbye',
        timestamp: 2
      });

      assert(!should_update);
    });

    it('should accept newer and different', function() {
      var should_update = quilter.docs.should_update({
        hash: 'hello',
        timestamp: 3
      }, {
        hash: 'goodbye',
        timestamp: 2
      });

      assert(should_update);
    });
  });
});