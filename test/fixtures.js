var path = require('path'),
    options = {
      good: {
        mount: 'demo',
        remote: 'http://localhost:5984/quilt',
      },
      bad: {
        mount: '...',
        remote: 'git://derp:omg@omg.github.derp/reveal'
      }
    };

function getCmd (action, opts) {
  return [
    path.normalize(path.join(__dirname, '..', 'bin', 'quilt.js')),
    action,
    '-m', 
    path.resolve(opts.mount),
    '-r', 
    opts.remote
  ].join('\ ');
}

module.exports = {
  options: options,
  getCmd: getCmd
};