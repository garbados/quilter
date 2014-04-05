# NICE TO HAVE

* winston logging :D

# UNTESTED CASES

* docs.remote.update: gracefully handle non-404 errors
* pull.update: attempt update when local file is newer
* pull.update: attempt update when hashes are identical
* pull.list: handle changes failure gracefully
* pull.list: delete a file
* pull.watch: delete a file
* pull.watch: stop while still processing
* push.update: handle non-404 errors gracefully
* push.update: update rather than insert
* push.update: update when hashes are identical
* push.update: update when remote doc is newer
* push.update: valid update >_>
* push.list: call done when queue is already empty
* push.watch: delete a file
* push.watch: stop while still processing
* util.config.get: handle non-json config file gracefully
* util.config.get: handle fs.readfile errors gracefully
* util.rmdir: handle fs.readdir errors gracefully

# ROADMAP

    bin                   [ ] TESTED [x] CODED
      .index              validate cli opts, then execute accordingly
    quilter
      .jobs               [x] TESTED [x] CODED
        .get              given command and options, returns a function partial
      .push               [x] TESTED [x] CODED
        .update           update a remote doc based on a local file
        .destroy          delete a remote doc based on a local file
        .list             push the state of the local dir to the remote
        .watch            push changes from the local dir to the remote indefinitely
          .close          stop watching for changes
      .pull               [x] TESTED [x] CODED
        .update           update a local file based on a remote doc
        .destroy          delete a local file based on a remote doc
        .list             pull the state of the remote to the local dir
        .watch            pull changes from the remote to the local dir indefinitely
          .close          stop watching for changes
      .sync               [ ] TESTED [ ] CODED
        .list             push and pull the state of the remote and the local dir
        .watch            push and pull the state of the remote and the local dir, indefinitely
      .docs
        .local            [x] TESTED [x] CODED
          .update         upsert a local file based on a remote doc
          .destroy        delete a local file
          .get            format a local file so it can be compared to remote docs
        .remote           [x] TESTED [x] CODED
          .update         upsert a remote doc based on a local file
          .destroy        delete a remote doc
          .get            retrieve a remote doc
      .util               [x] TESTED [x] CODED
        .config
          .get            returns the current config, or an empty array
          .add            adds a job to the current config
          .set            overwrites the current config with the given array
        .hash             generates an md5 hash based on a file's contents
        .mkdir            recursively creates directories along a path
        .rmdir            `rm -r` equivalent
        .file
          .path           returns the normalized path to the file, adding the mount point
          .id             returns the file id for a given path, stripping the mount point
          .type           returns the file's mimetype