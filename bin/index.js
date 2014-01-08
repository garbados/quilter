#!/usr/bin/env node

var argv = require('optimist').argv,
    command = argv._[0],
    forever = require('forever-monitor'),
    quilt = require('../lib');

quilt[command || 'all'](argv, function (err) {
  if (err) throw err;
  console.log(command, 'successful');
});