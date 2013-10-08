module.exports = function (mount, remote) {
  if (!mount || !remote) {
    throw new Error('Requires both a mount point and remote URL.');
  } else {
    console.log('you did it!');
  }
}