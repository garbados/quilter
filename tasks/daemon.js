var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

function cron (mount, remote, done) {
  require('crontab').load(function (err, tab) {
    if (err) { console.log(err); process.exit(1); }

    var command = [
      'sleep 10 &&', // wait for http interface to start working
      process.execPath,
      path.normalize(path.join(__dirname, '..', 'bin', 'quilt.js')),
      'init',
      '-m', 
      path.resolve(mount),
      '-r', 
      remote
    ].join(' ');
    tab.remove(tab.findCommand(command));

    var item = tab.create(command);
    item.everyReboot();
    tab.save(done);
  });
}

module.exports = function (mount, remote) {
  if (!mount || !remote) {
    throw new TypeError();
  } else {
    switch (process.platform){
      case 'darwin':
        // mac os x
        cron(mount, remote, function (err) {
            if (err) { console.log(err); process.exit(1); }
         
            console.log('saved');
        });
        break;
      case 'win32':
        // windows
        break;
      case 'linux':
        // linux, surprise surprise
        cron(mount, remote, function (err) {
            if (err) { console.log(err); process.exit(1); }
         
            console.log('saved');
        });
        break;
    }
  }
};