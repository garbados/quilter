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
  var source1 = 'test1';
  var source2 = 'test2';
  var file = '/derp.md';
  var other_file = '/herp.md';
  var content = '# hello';

  beforeEach(function (done) {
    async.series([
      fs.mkdir.bind(fs, source1, undefined),
      fs.mkdir.bind(fs, source2, undefined),
      fs.writeFile.bind(fs, source2 + file, content),
      fs.writeFile.bind(fs, source1 + other_file, content)
    ], done);
  });

  afterEach(function (done) {
    async.parallel([
      fs.unlink.bind(fs, source2 + file),
      fs.unlink.bind(fs, source1 + other_file),
      fs.rmdir.bind(fs, source1),
      fs.rmdir.bind(fs, source2),
      nano_instance.db.destroy.bind(nano_instance.db, db)
    ], done);
  });

  describe('a quilt pulling changes from the same database as another quilt is pushing to', function () {
    beforeEach(function (done) {
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

    it('will not affect the latter\'s filesystem', function (done) {
      fs.readFile(source1 + other_file, function (err) {
        assert(err, 'file should not exist');
        done();
      });
    });
  });

  describe('a quilt syncing changes with the same database as another quilt', function () {
    it('will pull changes from the latter\'s filesystem', function () {
      fs.readFile(source2 + file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });

    it('will push local changes to the latter\'s filesystem', function () {
      fs.readFile(source1 + other_file, function (err, buffer) {
        assert(!err, 'threw errors: ' + err);
        assert(buffer.toString().indexOf(content) > -1, 'incorrect file content: ' + buffer.toString());
        done();
      });
    });
  });
});

describe('[push, pull, sync] [watch: true]', function () {
  afterEach(function () {
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
  var jobs;

  beforeEach(function (done) {
    async.series([
      quilter.save.bind(quilter, job),
      quilter.jobs
    ], function (err, res) {
      assert(!err, 'threw errors: ' + err);
      console.log(res);
      jobs = res[1];
      done();
    });
  });

  describe('a quilt saving a job', function () {
    it('should not run that job', function (done) {
      nano(job.target, function (err, res) {
        assert.equal(res.status_code, 404, 'db exists but shouldn\'t');
      });
    });

    it('should write that job to disk', function () {
      assert(jobs.indexOf(job) > -1, 'job not saved');
    });
  });

  describe('a quilt listing saved jobs', function () {
    it('should output valid json', function () {
      assert.equal('object', typeof jobs, 'invalid json :(');
    });

    it('should obscure passwords', function () {
      assert.equal(JSON.stringify(jobs).indexOf('password'), -1, 'password not obscured');
    });
  });
});
