var assert = require('assert');
var quilter = require('../src-cov');

describe('quilter', function () {
  it('initializes without getting anyone killed', function () {
    var quilt = new quilter.init();
  });
});