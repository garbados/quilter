var assert = require('assert');
var async = require('async');
var pull = require('./pull');
var push = require('./push');

module.exports = function (job, done) {

  assert(job.source, 'job requires source');
  assert(job.target, 'job requires target');
  
  async.applyEach([pull, push], job, done);
};