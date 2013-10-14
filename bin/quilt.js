#!/usr/bin/env node

var program = require('commander'),
    prompt = require('prompt'),
    pkg = require('../package.json'),
    quilt = require('../index');

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
      quilt.init(program.mount, program.remote);
    });
  });

// daemon command
program
  .command('daemon')
  .description('Register quilt to autorun when system starts.')
  .action(function () {
    promptForOptions(program, function (program) {
      quilt.daemon(program.mount, program.remote);
    });
  });

// undaemon command
program
  .command('undaemon')
  .description('Unregister quilt from autorunning when system starts.')
  .action(function () {
    quilt.undaemon(program.mount, program.remote);
  });

// start!
program
  .parse(process.argv);