var fs = require('fs');
var assert = require('assert');
var async = require('async');
var util = require('./util');

module.exports = function (config, job, done) {
  // saves the `job` object to the file at the `config` path

  // set config to ~/.quilt.json if not set
  if (!done) {
    done = job;
    job = config;
    config = util.config;
  }

  assert(job.local, 'job requires local');
  assert(job.remote, 'job requires remote');
  assert(job.command, 'job requires command');

  async.waterfall([
    util.touch_config.bind(util, config),
    fs.readFile.bind(fs, config),
    function (buffer, done) {
      var data = JSON.parse(buffer.toString());
      data.push(job);
      done(null, JSON.stringify(data));
    },
    fs.writeFile.bind(fs, config)
  ], done);
};