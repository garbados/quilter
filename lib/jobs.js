var fs = require('fs');
var async = require('async');
var util = require('./util');

module.exports = function (job, done) {
  // reads the config file, obscuring passwords
  async.waterfall([
    util.touch_config.bind(util, job.config),
    fs.readFile.bind(fs, job.config),
    function (buffer, done) {
      var data = JSON.parse(buffer.toString().replace(/(https?:\/\/)(.*?):(.*?)@/g, '$1$2:*****@'));
      done(null, data);
    }
  ], done);
};