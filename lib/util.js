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
    var fp = fp
      .split(path.sep)
      .filter(function (row) { return row; })
      .join(sep);
    return fp;
  }
}

exports.filetype = function filetype (filename) {
  var extensions = {
    'jpeg':     'image/jpeg',
    'jpg':      'image/jpeg',
    'gif':      'image/gif',
    'png':      'image/png',
    'txt':      'text/plain',
    'md':       'text/plain',
    'mdown':    'text/plain',
    'markdown': 'text/plain'
  };

  function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
  }

  var ext = getExtension(filename);
  return extensions[ext] || 'application/octet-stream';
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