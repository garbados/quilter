var assert = require('assert');
var async = require('async');
var pull = require('./pull');
var push = require('./push');

module.exports = function (job, done) {

  assert(job.local, 'job requires local');
  assert(job.remote, 'job requires remote');
  
  async.applyEach([pull, push], job, done);
};