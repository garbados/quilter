var assert = require('assert');
var queue = require('./queue');

module.exports = function (job, done) {

  assert(job.source, 'job requires source');
  assert(job.target, 'job requires target');
  
  queue(job, done);
};