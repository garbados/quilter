# Quilter
[![Build Status](https://secure.travis-ci.org/garbados/quilter.png?branch=master)](http://travis-ci.org/garbados/quilter)
[![Coverage Status](https://coveralls.io/repos/garbados/quilter/badge.png)](https://coveralls.io/r/garbados/quilter)
[![Stories in Ready](https://badge.waffle.io/garbados/quilter.png?label=ready)](http://waffle.io/garbados/quilter)
[![NPM version](https://badge.fury.io/js/quilter.png)](http://badge.fury.io/js/quilter)


Push, pull, and sync files between local folders and a CouchDB / Cloudant database. Which is to say, it's an open-source Dropbox.

## Installation

    sudo npm install -g quilter
    quilt sync --local {folder} --remote {url} --watch

That's it! Quilter will watch files on the `remote` database and in the `local` folder, and will sync any changes that occur. To save that command for the future, use `--save`:

    quilt sync --local {folder} --remote {url} --watch --save
    quilt # runs all saved jobs

## Usage
    
    quilt [command] [--options]

## Commands

    quilt push    Push local files to the remote database.
    quilt pull    Pull remote files to the local folder.
    quilt sync    Push and pull files between the local folder and remote database.
    quilt jobs    List all saved jobs, obscuring any passwords.
    quilt         Runs all saved jobs.

## Options:

    --remote   [-r] Specifies the remote database to use.
                                        [default: "http://localhost:5984/quilt"]
    --mount    [-m] Specifies the local folder to push, pull, and sync files from.
                                                                  [default: "~"]
    --config   [-c] Specifies the configuration file to use.
                                                      [default: "~/.quilt.json"]
    --save     [-s] Instead of executing the given command, save it to the config
             file.                                              [default: false]
    --watch    [-w] Execute the given command, acting on any changes indefinitely.
                                                                [default: false]
    --verbose  [-v] Set logging level. Enter multiple times for more logging.     
    --log      Set logging level explicitly, ex: warn, info, verbose
                                                               [default: "warn"]

## Quilting on Startup

N.B. These instructions are for *nix systems, like Linux and Mac OS X. If you know how to quilt on startup in other environments, please make a [pull request](https://github.com/garbados/quilter/pulls)!

Using [forever](https://github.com/nodejitsu/forever) and `cron`, you can set Quilter to run on a regular basis. Like this:

    sudo npm install -g forever
    echo '@reboot' `which node` `which forever` '--minUptime 1' `which quilt` '-v' | crontab

That'll run all saved jobs whenever your computer starts. If Quilter fails, `forever` will restart it.

## Config

By default, jobs are saved to `~/.quilt.json`. It's just JSON, so you can edit it as you please. If it becomes invalid JSON, Quilter will get angry. Here's an example config file:

    [
      { 
        command: 'pull',
        local: 'testbutt',
        remote: 'http://localhost:5984/eggchair'
      } 
    ]

## Contributing

If you want to help but don't know how, check `todo.md` for a list of untested states, along with what module and function they pertain to.

Otherwise, make any changes you'd like to see, [make a pull request](https://github.com/garbados/quilter/pulls), and I'll merge it in once all the tests pass.

## Tests

The tests sync data with a live CouchDB instance running at `http://localhost:5984`, and uses the `quilt_test` database. So, to run the tests, make sure you have an instance listening at that URL, and don't keep data in that database. N.B.: The database is deleted after the tests are run.

To run the tests, clone the repository, and run `npm test`.

## License

[MIT](http://opensource.org/licenses/MIT), yo.
