#!/usr/bin/env node

var program = require('commander'),
    prompt = require('prompt'),
    pkg = require('../package.json'),
    daemon = require('../lib').Daemon,
    forever = require('forever-monitor'),
    path = require('path');

// prompts for options if they weren't passed
function promptForOptions (obj, cb) {
  var properties = [];
  prompt.start();

  ['mount', 'remote'].forEach(function (val) {
    if (!obj[val]) properties.push(val);
  });

  if (properties.length) {
    prompt.addProperties(obj, properties, function (err) {
      cb(obj);
    }); 
  } else {
    cb(obj);
  }
}

// register options
program
  .version(pkg.version)
  .usage('[action] [options]')
  .option('-m, --mount [dir]', 'File directory to watch for changes.')
  .option('-r, --remote [url]', 'CouchDB / Cloudant instance to sync with.');

// register commands
program
  .command('init')
  .description('Start syncing local files with remote instance.')
  .action(function () {
    promptForOptions(program, function (program) {
      var child = forever.start([
        process.execPath,
        path.resolve(__dirname, './quilt-init.js'), 
        path.resolve(program.mount),
        program.remote
      ], {
        max: Infinity,
        silent: true,
        spinSleepTime: 60000,
        minUptime: 1000,
        killTree: true
      });

      child.on('restart', function () {
        console.log('Quilt died. Restarting...');
      });

      child.on('exit', function () {
        console.log('Quilt finished.');
      });
    });
  });

// daemon command
program
  .command('daemon')
  .description('Register quilt to autorun when system starts.')
  .action(function () {
    promptForOptions(program, function (program) {
      daemon.create(program.mount, program.remote);
    });
  });

// undaemon command
program
  .command('undaemon')
  .description('Unregister quilt from autorunning when system starts.')
  .action(function () {
    daemon.destroy(program.mount, program.remote);
  });

// catch all
program
  .command('*')
  .action(function (){
    console.log(arguments);
    console.log(program);
});

// start!
program
  .parse(process.argv);