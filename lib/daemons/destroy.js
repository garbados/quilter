var path = require('path'),
    util = require('./util');

function cron (mount, remote, done) {
  require('crontab').load(function (err, tab) {
    if (err) { console.log(err); process.exit(1); }
    var command = util.getCmd(mount, remote);
    tab.remove(tab.findCommand(command));

    done();
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
         
            console.log('removed');
        });
        break;
      case 'win32':
        // windows
        throw new Error('Not Implemented :(');
        break;
      case 'linux':
        // linux, surprise surprise
        cron(mount, remote, function (err) {
            if (err) { console.log(err); process.exit(1); }
         
            console.log('removed');
        });
        break;
    }
  }
};