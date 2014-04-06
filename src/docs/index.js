// determine whether a should overwrite b
function should_update (a, b) {
  if (a.hash === b.hash) {
    // reject; identical hashes, nothing to do
    return false;
  } else if (a.timestamp < b.timestamp) {
    // reject; b is newer
    return false;
  } else {
    // accept; a is newer and different
    return true;
  }
}

module.exports = {
  local: require('./local'),
  remote: require('./remote'),
  should_update: should_update
};