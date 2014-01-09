var fs = require('fs');
var commands = {
  pull: require('./pull'),
  push: require('./push'),
  sync: require('./sync')
};
var async = require('async');
var util = require('./util');

module.exports = function (job, done) {
  var jobs = JSON.parse(fs.readFileSync(util.resolvePath(job.config)).toString());
  
  if (job.nowatch) jobs = jobs.filter(function (job) { return !job.watch; });

  async.map(jobs, function (job, done) {
    commands[job.command](job, done);
  }, done);
};