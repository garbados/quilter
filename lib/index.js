var util = require('./util');

var commands = {
  pull: require('./pull'),
  push: require('./push'),
  sync: require('./sync'),
  all:  require('./all'),
  save: require('./save'),
  jobs: require('./jobs')
};

Object.keys(commands).forEach(function (command) {
  var cmd = commands[command];
  commands[command] = function (job, done) {
    // handle defaults
    if (!done) {
      done = job;
      job = {};
    }

    job.config = job.config || util.config;

    cmd(job, done);
  };
});

module.exports = commands;