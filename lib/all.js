var commands = {
  pull: require('./pull'),
  push: require('./push'),
  sync: require('./sync')
};
var async = require('async');
var util = require('./util');

module.exports = function (config, job, done) {
  if (!done) {
    done = job;
    job = config;
    config = util.config;
  }

  var jobs = require(config);
  
  if (job.nowatch) jobs = jobs.filter(function (job) { return !job.watch; });

  async.map(jobs, function (job, done) {
    commands[job.command](job, done);
  }, done);
};