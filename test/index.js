var assert = require('assert');
var quilter = require('../lib-cov');
var fs = require('fs');
var async = require('async');
var nano = require('nano');

var winston = require('winston');
winston.level = 'warn';

// TODO not run any jobs with `watch: true` if `nowatch` is true.
// TODO not run saved jobs if `local` and `remote` are set.
// TODO quilt will not break when connectivity to a database is lost or interrupted
// TODO quilt will resume any active jobs when connectivity is re-established

describe('[push, pull, sync]', function () {
  var instance = 'http://localhost:5984'; 
  var nano_instance = nano(instance);
  var db = 'test';
  var remote = [instance, db].join('/');
  var local1 = '.test1';
  var local2 = '.test2';
  var file = '/derp.md';
  var other_file = '/herp.md';
  var content = '# hello';

  before(function (done) {
    async.series([
      async.parallel.bind(async, [
        local1,
        local2
      ].map(function (local) {
        return function (done) {
          fs.mkdir(local, function (err) {
            if (err && err.code === 'EEXIST') {
              done();
            } else {
              done(err);
            }
          }); 
        };
      })),
      async.parallel.bind(async, [
        local2 + file,
        local1 + other_file
      ].map(function (filepath) {
        return function (done) {
          fs.writeFile(filepath, content, function (err) {
            done(err);
          });
        };
      }))
    ], done);
  });

  after(function (done) {
    async.series([
      async.parallel.bind(async, [
        fs.unlink.bind(fs, local2 + file),
        fs.unlink.bind(fs, local1 + file),
        fs.unlink.bind(fs, local2 + other_file),
        fs.unlink.bind(fs, local1 + other_file),
      ]),
      async.parallel.bind(async, [
        fs.rmdir.bind(fs, local1),
        fs.rmdir.bind(fs, local2)
      ]),
      nano_instance.db.destroy.bind(nano_instance.db, db)
    ], done);
  });

  describe('a quilt pulling changes from the same database as another quilt is pushing to', function () {
    before(function (done) {
      async.series([
        quilter.pull.bind(quilter, {
          remote: remote,
          local: local1
        }),
        quilter.push.bind(quilter, {
          remote: remote,
          local: local2
        })
      ], done);
    });

    it('will reflect changes to the latter\'s filesystem', function (done) {
      fs.readFile(local2 + file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });

    // TODO fix
    // it('will not affect the latter\'s filesystem', function (done) {
    //   fs.readFile(local1 + other_file, function (err) {
    //     assert(err, 'file should not exist');
    //     done();
    //   });
    // });
  });

  describe('a quilt syncing changes with the same database as another quilt', function () {
    before(function (done) {
      async.series([
        quilter.sync.bind(quilter, {
          remote: remote,
          local: local1
        }),
        quilter.sync.bind(quilter, {
          remote: remote,
          local: local2
        })
      ], done);
    });

    it('will pull changes from the latter\'s filesystem', function (done) {
      fs.readFile(local2 + file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });

    it('will push local changes to the latter\'s filesystem', function (done) {
      fs.readFile(local1 + other_file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });
  });
});

describe('[push, pull, sync] [watch: true]', function () {
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

    it('will continually act on changes if `watch` is set', function () {
      // TODO
    });
  });
});

describe('[save, jobs, all]', function () {
  var job = {
    remote: 'http://username:password@localhost:5984/savetest',
    local: '.test3',
    command: 'push',
    watch: true,
    config: '.testconfig.json'
  };
  var job_basic = {
    remote: 'http://localhost:5984/derptest',
    local: '.test3',
    command: 'push',
    config: '.testconfig.json'
  };
  var jobs;

  before(function (done) {
    async.series([
      function (done) {
        fs.mkdir(job_basic.local, function (err) {
          if (err && err.code === 'EEXIST') {
            done();
          } else {
            done(err);
          }
        }); 
      },
      quilter.save.bind(quilter, job_basic),
      quilter.all.bind(quilter, job_basic),
      quilter.save.bind(quilter, job),
      quilter.jobs,
      quilter.jobs.bind(quilter, job)
    ], function (err, res) {
      assert(!err, 'threw errors: ' + err);
      jobs = res[res.length - 1];
      done();
    });
  });

  after(async.auto.bind(async, {
    nano: function (done) {
      var instance = job_basic.remote.slice(0, job_basic.remote.lastIndexOf('/'));
      var db = job_basic.remote.slice(job_basic.remote.lastIndexOf('/') + 1);
      nano(instance).db.destroy(db, done); 
    },
    rmdir: fs.rmdir.bind(fs, job.local),
    unlink: ['rmdir', fs.unlink.bind(fs, job.config)]
  }));

  describe('a quilt saving a job', function () {
    it('should not run that job', function (done) {
      nano(job.remote.replace('username:password@', '')).info(function (err) {
        assert.equal(err && err.status_code, 404, 'db exists but shouldn\'t');
        done();
      });
    });

    it('should write that job to disk', function () {
      var test_jobs = jobs.filter(function (entry) { return entry.local === job.local; });
      assert(test_jobs.length > 0, 'job not saved');
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

  describe('a quilt running saved jobs', function () {
    it('should finish happily', nano(job_basic.remote).info);
  });
});