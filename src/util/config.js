var async = require('async');
var fs = require('fs');

// get the current config
// if it doesn't exist
// return an empty array
function config_get (fp, done) {
  if (!done) {
    done = fp;
    fp = this.config_path;
  }

  fs.exists(fp, function (exists) {
    if (exists) {
      fs.readFile(fp, function (err, buffer) {
        if (err) {
          done(err);
        } else {
          try {
            var config = JSON.parse(buffer.toString());
            done(null, config);
          } catch (e) {
            done(e);
          }
        }
      });
    } else {
      done(null, []);
    }
  });
}

// overwrite the current config
function config_set (fp, config, done) {
  if (!done) {
    done = config;
    config = fp;
    fp = this.config_path;
  }

  fs.writeFile(fp, JSON.stringify(config, undefined, 2), done);
}

// add one or more jobs to the config
function config_add (fp, config, done) {
  if (!done) {
    done = config;
    config = fp;
    fp = this.config_path;
  }

  async.waterfall([
    config_get.bind(this, fp),
    function (new_config, done) {
      if (config.length) {
        new_config = new_config.concat(config);
      } else {
        new_config.push(config);
      }

      done(null, new_config);
    },
    config_set.bind(this, fp)
  ], done);
}

module.exports = {
  get: config_get,
  set: config_set,
  add: config_add
};