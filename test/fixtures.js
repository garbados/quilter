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
    return  {
        cmd : path.normalize(path.join(__dirname, '..', 'bin', 'quilt.js')),
        args: [
            action,
            '-m', 
            path.resolve(opts.mount),
            '-r', 
            opts.remote
          ]
    }
}

module.exports = {
  options: options,
  getCmd: getCmd
};
