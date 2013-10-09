var path = require('path'),
    fs = require('fs');

function getUserHome () {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}    

function resolvePath (mount) {
  if (mount === '.') mount = process.cwd();
  return path.normalize(mount.replace('~', getUserHome()));
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
exports.filetype = filetype;
exports.mkdirParent = mkdirParent;
exports.dirpath = dirpath;