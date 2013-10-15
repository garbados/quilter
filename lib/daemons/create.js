var path = require('path'),
    util = require('./util');

function cron (mount, remote, done) {
  require('crontab').load(function (err, tab) {
    if (err) { console.log(err); process.exit(1); }
    var command = util.getCmd(mount, remote);

    // removes duplicates
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
        throw new Error('Not Implemented :(');
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