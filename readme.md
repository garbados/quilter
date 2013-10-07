# Quilt [![Build Status](https://secure.travis-ci.org/garbados/quilt.png?branch=master)](http://travis-ci.org/garbados/quilt)

Maps a file directory to a CouchDB / Cloudant database.

## Installation

    sudo npm install -g quilt
    quilt init
    # tell quilt what to watch, and where to put it

That's it! Quilt will watch any files in the folder you tell it to watch, and push them to the remote instance whenever they change. Or, you can do this to avoid any prompting:

    quilt init --mount {folder} --remote {url}

Or, even shorter:

    quilt init -m {folder} -r {url}

## Quilting on Startup

    quilt daemon
    # tell quilt what to watch, and where to put it    

Then, when you start your computer, quilt will start watching your files automatically. `quilt daemon` can use the `--mount` and `--remote` options like `quilt init` to skip prompting.

To stop quilt from autostarting, do this:

    quilt undaemon

Without any options, this will remove all `quilt` commands from automatically starting. Use `--mount` and `--remote` to remove only the commands that watch the given folder, and/or push to the given remote instance.

## Commands

* `quilt init`: Starts mapping a file directory to a CouchDB / Cloudant instance. If the mountpoint and remote instance are not given as command-line options, the command will prompt for them.
* `quilt daemon`: Adds a quilt command to run on startup. If the mountpoint and remote instance are not given as command-line options, the command will prompt for them.
* `quilt undaemon`: Removes any quilt commands from running on startup. If `-m` or `-r` options are used, `undaemon` will only remove matching commands.

## Options

* `--mount` or `-m`: Indicates the folder to watch. Can be either a relative or direct path, ex: "~/Documents"
* `--remote` or `-r`: Indicates where to push files when they change. Must be a full URL, like `https://garbados.cloudant.com/quilt`.

## Testing

To run the test suite first invoke the following command within the repo, installing the development dependencies:

    npm install

then run the tests:

    npm test