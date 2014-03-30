var assert = require('assert');
var quilter = require('../../src-cov');
var fs = require('fs');
var async = require('async');
var nano = require('nano');

var winston = require('winston');
winston.level = 'warn';

describe('util', function () {
  it('should create an md5 hash based on a file\'s contents', function (done) { 
    fs.writeFile('./test_file', 'hello friend', function (err) {
      if (err) throw err;

      quilter.util.hash('./test_file', function (err, hash) {
        if (err) throw err;
        assert.notEqual(hash, 'hello friend');
      });
    });
  });

  it('should create nested directories', function (done) {
    // none of these directories should exist
    // so let's make all of them
    quilter.util.mkdir('./derp/herp/omg', function (err) {
      if (err) {
        throw err;
      } else {
        // destroy the root directory
        fs.rmdir('./derp', function (err) {
          console.log(err);
          if (err) {
            throw err;
          } else {
            done();
          }
        });
      }
    });
  });
});