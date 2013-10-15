var path = require('path');

exports.getCmd = function getCmd (mount, remote) {
  return [
    'sleep 5 &&', // wait for http interface to start working
    process.execPath,
    path.normalize(path.join(__dirname, '..', 'bin', 'quilt.js')),
    'init',
    '-m', 
    path.resolve(mount),
    '-r', 
    remote
  ].join(' ');
}