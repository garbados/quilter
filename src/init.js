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

// TODO bind all functions to the instance
// bind also to prototypes so you can consume them directly
Quilter.prototype.push = push;
Quilter.prototype.pull = pull;
Quilter.prototype.util = util;
Quilter.prototype.docs = docs;

module.exports = function (config) {
  return new Quilter(config);
};