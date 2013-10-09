var path = require('path'),
    fs = require('fs');

var sep = '%%';

function getUserHome () {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}    

function resolvePath (mount) {
  if (mount === '.') mount = process.cwd();
  mount = path.normalize(mount.replace('~', getUserHome()));
  return mount;
}

function filepath (mount) {
  return function (id) {
    var fp = id.split(sep);
    fp.unshift(mount);
    return fp.join(path.sep);
  }
}

function file_id (mount) {
  return function (f) {
    var fp;
    if (f.indexOf(mount) !== -1) {
      fp = f.slice(f.indexOf(mount) + mount.length).split(path.sep);
    } else {
      fp = f.split(path.sep);
    }
    return fp.join(sep);
  }
}

function filetype (filename) {
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

function mkdirParent (dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    } else if (error && error.code === 'EEXIST') {
      callback && callback(error);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};

function dirpath (filepath) {
  var dirs = filepath.split('/');
  dirs.pop();
  dirs = dirs.join('/');
  return dirs;
}

exports.resolvePath = resolvePath;
exports.file_id = file_id;
exports.filepath = filepath;
exports.filetype = filetype;
exports.mkdirParent = mkdirParent;
exports.dirpath = dirpath;