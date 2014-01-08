var assert = require('assert');
var queue = require('./queue');

module.exports = function (job, done) {

  assert(job.local, 'job requires local');
  assert(job.remote, 'job requires remote');
  
  queue(job, done);
};