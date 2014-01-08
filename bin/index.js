#!/usr/bin/env node

var argv = require('optimist').argv,
    command = argv._[0],
    quilt = require('../lib'),
    log = require('winston');

function on_complete (err, res) {
  if (err) {
    log.warn(err);
  } else {
    log.info(res || 'success!'); 
  }
}

// set logging level
if (argv.log) {
  log.level = argv.log;
} else {
  log.level = 'warn';
}

// save the given command
if (argv.save) {
  // get opts to save
  var opts = {
    command: command,
    local: argv.local,
    remote: argv.remote,
    watch: argv.watch
  };

  // save to custom config file
  if (argv.config) {
    quilt.save(argv.config, opts, on_complete);
  // or not
  } else {
    quilt.save(opts, on_complete);
  }
// or, list all jobs
} else if (command === 'jobs') {
  quilt.jobs(argv, function (err, res) {
    if (err) log.warn(err);
    if (res) console.log(res);
  });
// or, execute it instead
} else {
  if (command) {
    if (command in quilt) {
      quilt[command](argv, on_complete);
    } else {
      log.warn('%s is not a recognized command', command);
    }
  } else {
    quilt.all(argv, on_complete);
  }
}