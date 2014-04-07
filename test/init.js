var assert = require('assert');
var quilter = require('../src-cov');

describe('init', function () {
  it('creates a new instance without getting anyone killed', function () {
    var quilt = quilter.init();
    // ensure defaults are set, whatever they might be
    assert(quilt.mount);
    assert(quilt.remote);
    assert(quilt.config_path);
  });
});