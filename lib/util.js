var path = require('path'),
    fs = require('fs'),
    async = require('async'),
    crypto = require('crypto');

var sep = '::::';

function getUserHome () {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}    

exports.resolvePath = function resolvePath (mount) {
  if (mount === '.') mount = process.cwd();
  mount = path.normalize(mount.replace('~', getUserHome()));
  return mount;
}

exports.getMd5Hash = function getMd5Hash (f) {
  var hash = crypto.createHash('md5'),
      data = fs.readFileSync(f);
      digest = hash.update(data).digest('base64');

  return digest;
}

exports.filepath = function filepath (mount) {
  return function (id) {
    var fp = path.join(mount, id.split(sep).join(path.sep));
    return fp;
  }
}

exports.file_id = function file_id (mount) {
  return function (f) {
    var fp = f;
    if (f.indexOf(mount) !== -1) {
      fp = f.slice(f.indexOf(mount) + mount.length);
    }
    return fp.replace(path.sep, sep);
  }
}

exports.filetype = function filetype (filename) {
  var match = filename.match(/\.(jpg|jpeg|png|gif)$/i);
  if (match) {
    var ext = match[1];
    switch(ext){
      case 'jpg':
        ext = 'jpeg';
        break;
    }
    return 'image/' + ext;
  } else {
    return 'text/plain';
  }
}

exports.mkdirParent = function mkdirParent (dirPath, mode, callback) {
  // Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    var tasks = [];
    // When it fail in this way, do the custom steps
    if (error && [34, 47].indexOf(error.errno) !== -1) {
      // Create the directory after...
      tasks.shift(function (done) {
        mkdirParent(dirPath, mode, done);
      });
      // Creating all the parents recursively
      tasks.shift(function (done) {
        mkdirParent(path.dirname(dirPath), mode, done);
      });
    } else {
      // pass along any unexpected errors
      tasks.push(function (done) {
        done(error);
      });
    }
    async.series(tasks, callback);
  });
};