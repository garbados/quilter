var assert = require('assert');
var quilter = require('../../src-cov');

describe('file utils', function () {
  it('should resolve relative paths', function () {
    var filepath = quilter.util.file.path('herp/derp/../../success');
    assert.equal(filepath, 'success');
  });

  it('should resolve user paths', function () {
    var filepath = quilter.util.file.path('~/Pictures');
    assert.notEqual(filepath, '~/Pictures');
  });

  it('should strip absolute paths of the mount path', function () {
    var file_id = quilter.util.file.id('herp/derp', 'herp/derp/success');
    assert.equal(file_id, 'success');
  });

  it('should determine filetypes', function () {
    var filetype = quilter.util.file.type('derp.txt');
    assert.equal(filetype, 'text/plain');
  });
});