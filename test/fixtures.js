var path = require('path'),
    spawn = require('child_process').spawn;

var options = {
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
  };
}

function getChild (action, opts) {
  var cmd = getCmd(action, opts),
      child = spawn(cmd.cmd, cmd.args);

  return child;
}

module.exports = {
  options: options,
  getChild: getChild
};
