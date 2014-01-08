var fs = require('fs');
var async = require('async');
var util = require('./util');

module.exports = function (config, done) {
  // set config to ~/.quilt.json if not set
  if (!done) {
    done = config;
    config = util.config;
  }

  // reads the config file, obscuring passwords
  async.waterfall([
    util.touch_config.bind(util, config),
    fs.readFile.bind(fs, config),
    function (buffer, done) {
      var data = JSON.parse(buffer.toString().replace(/(http:\/\/)(.*?):(.*?)@/, '$1$2:*****@'));
      done(null, data);
    }
  ], done);
};