var assert = require('assert');
var quilter = require('../../src-cov');
var fs = require('fs');
var async = require('async');
var request = require('request');
var path = require('path');

describe('push', function () {
  beforeEach(function () {
    this.mount = './derp';
    this.remote = 'http://localhost:5984/quilt_test';
    this.config_path = './derp_config.json';
  });

  describe('update', function () {
    // TODO update a local file based on a remote doc
  });

  describe('destroy', function () {
    // TODO delete a local file based on a remote doc
  });

  describe('list', function () {
    // TODO pull the state of the remote to the local dir
  });

  describe('watch', function () {
    // TODO pull changes from the remote to the local dir indefinitely
  });

  afterEach(function (done) {
    async.series([
      request.bind(request, {
        url: this.remote,
        method: 'DELETE'
      }),
      quilter.util.rmdir.bind(null, this.mount),
      fs.unlink.bind(fs, this.config_path)
    ], done);
  });
});
