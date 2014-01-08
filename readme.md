# Quilt [![Build Status](https://secure.travis-ci.org/garbados/quilter.png?branch=master)](http://travis-ci.org/garbados/quilter) [![Stories in Ready](https://badge.waffle.io/garbados/quilter.png?label=ready)](http://waffle.io/garbados/quilter) [![NPM version](https://badge.fury.io/js/quilter.png)](http://badge.fury.io/js/quilter)

Maps a file directory to a CouchDB / Cloudant database. Which is to say, it's an open-source Dropbox.

## Installation

    sudo npm install -g quilter
    quilt sync --local {folder} --remote {url} --watch

That's it! Quilt will watch files on the `remote` database and in the `local` folder, and will sync any changes that occur. To save that command for the future, use `--save`:

    quilt sync --local {folder} --remote {url} --watch --save
    quilt # runs all saved jobs

## Commands

* `pull`: pull files from `remote` into `local`
* `push`: push files from `local` up to `remote`
* `sync`: push and pull files from and to `local` and `remote`
* (default): run all saved jobs
* `jobs`: list all saved jobs

## Options

* `--local`: a local folder, like `~/Pictures`.
* `--remote`: a remote database, like a CouchDB or Cloudant instance.
* `--save`: save the given command for later re-use.
* `--watch`: continue watching and reacting to changes indefinitely.
* `--config`: path to a non-default file to use for saving and reading configuration values.
* `--log`: indicates level for logging. Choose from error, warn, info, verbose, debug, and silly.

## Quilting on Startup

*These instructions are for \*nix systems, like Linux and Mac OS X*

Using [forever](https://github.com/nodejitsu/forever) and `cron`, you can set Quilt to run on a regular basis. Like this:

    sudo npm install -g forever
    echo '@reboot forever quilt' | crontab

That'll run all saved jobs whenever your computer starts. If Quilt fails, `forever` will restart it.

## Config

By default, jobs are saved to `~/.quilt.json`. It's just JSON, so you can edit it as you please. If it becomes invalid JSON, Quilt will get angry. Here's an example config file:

    [
      { 
        command: 'pull',
        local: 'testbutt',
        remote: 'http://localhost:5984/eggchair'
      } 
    ]

## Tests

The tests sync data with a live CouchDB instance running at `http://localhost:5984`. So, to run the tests, make sure you have an instance listening at that URL.

To run the tests, do `npm test`.
