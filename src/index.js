var push = require('./push');
var pull = require('./pull');
var util = require('./util');
var docs = require('./docs');

function Quilter (config) {
  config = config || {};
  this.mount = config.mount || '~';
  this.remote = config.remote || 'http://localhost:5984/quilt';
  this.config_path = config.config_path || '~/.quilt.json';

  return this;
}

Quilter.prototype.push = push;
Quilter.prototype.pull = pull;
Quilter.prototype.util = util;

module.exports = {
  push: push,
  pull: pull,
  util: util,
  docs: docs,
  init: Quilter
};