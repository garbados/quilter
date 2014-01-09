var fs = require('fs');
var assert = require('assert');
var async = require('async');
var util = require('./util');

module.exports = function (job, done) {
  assert(job.local, 'job requires local');
  assert(job.remote, 'job requires remote');
  assert(job.command, 'job requires command');

  async.waterfall([
    util.touch_config.bind(util, job.config),
    fs.readFile.bind(fs, job.config),
    function (buffer, done) {
      var data = JSON.parse(buffer.toString());
      data.push(job);
      done(null, JSON.stringify(data));
    },
    fs.writeFile.bind(fs, job.config)
  ], done);
};