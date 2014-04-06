var push = require('./push');
var pull = require('./pull');
var sync = require('./sync');
var util = require('./util');
var docs = require('./docs');

function Quilter (config) {
  config = config || {};
  this.mount = config.mount || '~';
  this.remote = config.remote || 'http://localhost:5984/quilt';
  this.config_path = config.config_path || '~/.quilt.json';

  // plugins!
  this.plugin('push', push);
  this.plugin('pull', pull);
  this.plugin('sync', sync);
  this.plugin('util', util);
  this.plugin('docs', docs);

  return this;
}

Quilter.prototype.plugin = function (name, plugin) {
  var self = this;

  // defaults
  if (!plugin) {
    plugin = name;
    name = null;
  }

  // bind `this` to functions recursively
  if (typeof(plugin) === 'object') {
    // call `plugin` on each key
    // so that on contained objects
    // we can recurse
    Object.keys(plugin).forEach(function (key) {
      plugin[key] = self.plugin.call(self, plugin[key]);
    });
  } else if (typeof(plugin) === 'function') {
    // bind `this` to the function
    plugin = plugin.bind(this);
  } else {
    throw "Unhandled type: " + typeof(plugin);
  }

  // bind to `this`
  if (name) {
    this[name] = plugin;
  }

  return plugin;
};

module.exports = function (config) {
  return new Quilter(config);
};