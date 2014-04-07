#!/usr/bin/env node

var quilter = require('../src'),
    log = require('winston');

var default_quilt = quilter.init();

var known_commands = [
  undefined,
  'push',
  'pull',
  'sync',
  'jobs'
];

var logging_levels = [ 
  // 'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly'
];

var yargs = require('yargs')
    .wrap(80)
    .usage('Push, pull, and sync files between local folders and a CouchDB / Cloudant database.\nUsage: $0 [command] [--options]')
    .example('$0 push', 'Push local files to the remote database.')
    .example('$0 pull', 'Pull remote files to the local folder.')
    .example('$0 sync', 'Push and pull files between the local folder and remote database.')
    .example('$0 jobs', 'List all saved jobs, obscuring any passwords.')
    .example('$0', 'Runs all saved jobs.')
    .alias({
      r: 'remote',
      m: 'mount',
      l: 'local',
      local: 'mount',
      c: 'config',
      s: 'save',
      w: 'watch',
      v: 'verbose'
    })
    .describe({
      remote: '[-r] Specifies the remote database to use.',
      mount: '[-m] Specifies the local folder to push, pull, and sync files from.',
      config: '[-c] Specifies the configuration file to use.',
      save: '[-s] Instead of executing the given command, save it to the config file.',
      watch: '[-w] Execute the given command, acting on any changes indefinitely.',
      verbose: '[-v] Set logging level. Enter multiple times for more logging.',
      log: 'Set logging level explicitly, ex: warn, info, verbose'
    })
    .boolean(['watch', 'save'])
    .count('verbose')
    .default({
      remote: default_quilt.remote,
      mount: default_quilt.mount,
      config: default_quilt.config_path,
      save: false,
      watch: false,
      log: 'warn'
    });

var argv = yargs.argv;
var command = argv._[0];
var options = argv;

if (known_commands.indexOf(command) === -1) {
  console.log(yargs.help());
} else {
  if (argv.verbose) {
    log.level = logging_levels[argv.verbose] || 'warn'; 
  } else {
    log.level = argv.log;
  }
  quilter.jobs.get(command, options, function (err, func) {
    if (err) throw err;
    func(function (err, result) {
      if (err) throw err;
      if (typeof(result) === 'string') {
        console.log(result);
      }
    });
  }); 
}