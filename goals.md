# Goals

Quilter syncs files and folders with replication-compliant databases. Data across multiple machines and devices can be synced to the same database, effectively sharing files and folders much like DropBox.

## `quilt`

`quilt` is Quilter's command-line interface (CLI), and has these commands:

N.B. If called without a command, `quilt` will run every job in the configuration file. If there are any jobs with `watch: true`, it will begin watching those, unless `nowatch` has been set.

### `push`

Options:

* `-t --target [remote]`: URL of the remote database to push changes to.
* `-s --source [path]`: path to the file or folder to read from.
* `-w --watch`: continues watching for changes even after completion, rather than exiting.
* `-a --save`: save this `source`, `target`, command, and `watch` boolean to the configuration file, but do not run.
* `-n --nowatch`: runs every saved job except those with `watch: true`.
* `-l --log [level]`: sets how talkative the logger is.
* `-c --config [path]`: path to the file to use for reading and writing saved jobs.

Pushes local filesystem changes to the remote database.

Unless `watch` is set, the job will exit when the target reflects the source's state. If `watch` is set, the job will continue pushing any changes that occur until the process is killed.

### `pull`

Like `push`, but pulls the contents of the remote database to the local filesystem.

### `sync`

`push` and `pull` simultaneously. Exits when both the local filesystem and remote database are in sync.

### `help`

Print some help about available commands.

### `jobs`

Print out the current job list -- that is, what would be run if `quilt` were run without a command.

## Tests

The testing suite should ensure that...

* A quilt pulling from the same database another quilt is pushing to will
  - reflect changes on the latter's filesystem
  - not affect the latter's filesystem
  - have local changes overwritten when the latter changes
* a quilt syncing with the same database as another quilt will
  - pull changes from the latter's filesystem
  - push local changes to the latter's filesystem
  - have local changes overwritten when the latter changes
* stop when a `source` and `target` reflect all inteded changes, unless `watch` is true.
* not run any jobs with `watch: true` if `nowatch` is true.
* not run saved jobs if `source` and `target` are set.
* quilt will not break when connectivity to a database is lost or interrupted
* quilt will resume any active jobs when connectivity is re-established

## Thoughts

In order to save space, change history is not stored locally. If a database becomes unavailable, requests are queued and retried until the connection returns.

Use `~/.quilt.json` to store configuration values.