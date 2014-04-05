#!/usr/bin/env node

var quilter = require('../src'),
    log = require('winston');

var default_quilt = quilter.init();

var known_commands = [
  undefined,
  'push',
  'pull',
  'sync'
];

var yargs = require('yargs')
    .wrap(80)
    .usage('Push, pull, and sync files between local folders and a CouchDB / Cloudant instance.\nUsage: $0 [command] [--options]')
    .example('$0 push', 'Push local files to the remote database.')
    .example('$0 pull', 'Pull remote files to the local folder.')
    .example('$0 sync', 'Push and pull files between the local folder and remote database.')
    .example('$0', 'Runs all saved jobs.')
    .alias({
      r: 'remote',
      m: 'mount',
      c: 'config',
      s: 'save',
      w: 'watch'
    })
    .describe({
      remote: 'Specifies the remote database to use.',
      mount: 'Specifies the local folder to push, pull, and sync files from.',
      config: 'Specifies the configuration file to use.',
      save: 'Instead of executing the given command, save it to the config file.',
      watch: 'Execute the given command, acting on any changes indefinitely.'
    })
    .boolean(['watch', 'save'])
    .default({
      remote: default_quilt.remote,
      mount: default_quilt.mount,
      config: default_quilt.config_path,
      save: false,
      watch: false
    });

var argv = yargs.argv;
var command = argv._[0];
var options = argv;

if (known_commands.indexOf(command) === -1) {
  yargs.showHelp();
} else {
  quilter.jobs.get(command, options, function (err, func) {
    if (err) throw err;
    func(function (err) {
      if (err) throw err;
      console.log('success!');
    });
  }); 
}