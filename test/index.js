var assert = require('assert');
var quilter = require('../lib');
var fs = require('fs');
var async = require('async');
var nano = require('nano');

// TODO not run any jobs with `watch: true` if `nowatch` is true.
// TODO not run saved jobs if `source` and `target` are set.
// TODO quilt will not break when connectivity to a database is lost or interrupted
// TODO quilt will resume any active jobs when connectivity is re-established

describe('[push, pull, sync]', function () {
  var instance = 'http://localhost:5984'; 
  var nano_instance = nano(instance);
  var db = 'test';
  var target = [instance, db].join('/');
  var source1 = '.test1';
  var source2 = '.test2';
  var file = '/derp.md';
  var other_file = '/herp.md';
  var content = '# hello';

  before(function (done) {
    async.series([
      async.parallel.bind(async, [
        source1,
        source2
      ].map(function (source) {
        return function (done) {
          fs.mkdir(source, function (err) {
            if (err && err.code === 'EEXIST') {
              done();
            } else {
              done(err);
            }
          }); 
        };
      })),
      async.parallel.bind(async, [
        source2 + file,
        source1 + other_file
      ].map(function (filepath) {
        return function (done) {
          fs.writeFile(filepath, content, function (err) {
            done(err);
          });
        }
      }))
    ], done);
  });

  after(function (done) {
    async.series([
      async.parallel.bind(async, [
        fs.unlink.bind(fs, source2 + file),
        fs.unlink.bind(fs, source1 + file),
        fs.unlink.bind(fs, source2 + other_file),
        fs.unlink.bind(fs, source1 + other_file),
      ]),
      async.parallel.bind(async, [
        fs.rmdir.bind(fs, source1),
        fs.rmdir.bind(fs, source2)
      ]),
      nano_instance.db.destroy.bind(nano_instance.db, db)
    ], done);
  });

  describe('a quilt pulling changes from the same database as another quilt is pushing to', function () {
    before(function (done) {
      async.series([
        quilter.pull.bind(quilter, {
          target: target,
          source: source1
        }),
        quilter.push.bind(quilter, {
          target: target,
          source: source2
        })
      ], done);
    });

    it('will reflect changes to the latter\'s filesystem', function (done) {
      fs.readFile(source2 + file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });

    // TODO fix
    // it('will not affect the latter\'s filesystem', function (done) {
    //   fs.readFile(source1 + other_file, function (err) {
    //     assert(err, 'file should not exist');
    //     done();
    //   });
    // });
  });

  describe('a quilt syncing changes with the same database as another quilt', function () {
    before(function (done) {
      async.series([
        quilter.sync.bind(quilter, {
          target: target,
          source: source1
        }),
        quilter.sync.bind(quilter, {
          target: target,
          source: source2
        })
      ], done);
    });

    it('will pull changes from the latter\'s filesystem', function (done) {
      fs.readFile(source2 + file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });

    it('will push local changes to the latter\'s filesystem', function (done) {
      fs.readFile(source1 + other_file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });
  });
});

describe('[push, pull, sync] [watch: true]', function () {
  after(function () {
    describe('will continually act on changes if `watch` is set', function () {
      // TODO
    });
  });

  describe('a quilt syncing changes with the same database as another quilt', function () {
    beforeEach(function () {
      // TODO
    });

    it('will pull changes from the latter\'s filesystem', function () {
      // TODO
    });

    it('will push local changes to the latter\'s filesystem', function () {
      // TODO
    });
  });
});

describe('[save, jobs]', function () {
  var job = {
    target: 'http://username:password@localhost:5984/test',
    source: 'test',
    command: 'push',
    watch: true
  };
  var config = '.testconfig.json';
  var jobs;

  before(function (done) {
    async.series([
      quilter.save.bind(quilter, config, job),
      quilter.jobs.bind(quilter, config)
    ], function (err, res) {
      assert(!err, 'threw errors: ' + err);
      jobs = res[res.length - 1];
      done();
    });
  });

  after(fs.unlink.bind(fs, config));

  describe('a quilt saving a job', function () {
    it('should not run that job', function (done) {
      nano(job.target.replace('username:password@', '')).info(function (err) {
        assert.equal(err.status_code, 404, 'db exists but shouldn\'t');
        done();
      });
    });

    it('should write that job to disk', function () {
      var test_jobs = jobs.filter(function (entry) { return entry.source === job.source; });
      assert(test_jobs.length === 1, 'job not saved');
    });
  });

  describe('a quilt listing saved jobs', function () {
    it('should output valid json', function () {
      assert.equal('object', typeof jobs, 'invalid json :(');
    });

    it('should obscure passwords', function () {
      assert.equal(JSON.stringify(jobs).indexOf(':password@'), -1, 'password not obscured');
    });
  });
});
