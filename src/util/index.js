var async = require('async');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

function hash (fp, done) {
  var md5_hash = crypto.createHash('md5');
      data = fs.readFile(fp);

  fs.readFile(fp, function (err, buffer) {
    if (err) {
      done(err);
    } else {
      var data = buffer.toString();
      digest = md5_hash.update(data).digest('base64');
      done(null, digest);
    }
  });
}

// create a directory path recursively
function mkdir (fp, mode, done) {
  // defaults
  if (!done) {
    done = mode;
    mode = null;
  }

  // Call the standard fs.mkdir
  fs.mkdir(fp, mode, function (error) {
    var tasks = [];
    // When it fail in this way, do the custom steps
    if (error && 34 === error.errno) {
      // Create the directory after...
      tasks.unshift(function (done) {
        mkdir(fp, mode, done);
      });
      // Creating all the parents recursively
      tasks.unshift(function (done) {
        mkdir(path.dirname(fp), mode, done);
      });
    } else if (error && error.errno === 47) {
      // directory already exists; do nothing
    } else {
      // pass along any unexpected errors
      tasks.unshift(function (done) {
        done(error);
      });
    }

    async.series(tasks, done);
  });
}

module.exports = {
  hash: hash,
  mkdir: mkdir,
  file: require('./file'),
  config: require('./config')
};