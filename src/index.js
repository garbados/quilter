var push = require('./push');
var pull = require('./push');
var util = require('./util');

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
  init: Quilter
};