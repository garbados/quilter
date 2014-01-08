var fs = require('fs');
var async = require('async');
var util = require('./util');

module.exports = function (job, done) {
  // set config to ~/.quilt.json if not set
  if (!done) {
    done = job;
    job = {
      config: util.config
    };
  }

  // handle config when it's either a string or an object
  if (typeof job === 'string') {
    config = job;
  } else {
    config = job.config || util.config; 
  }

  // reads the config file, obscuring passwords
  async.waterfall([
    util.touch_config.bind(util, config),
    fs.readFile.bind(fs, config),
    function (buffer, done) {
      var data = JSON.parse(buffer.toString().replace(/(https?:\/\/)(.*?):(.*?)@/, '$1$2:*****@'));
      done(null, data);
    }
  ], done);
};