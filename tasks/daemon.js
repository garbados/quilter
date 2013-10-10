module.exports = function (mount, remote) {
  if (!mount || !remote) {
    throw new TypeError();
  } else {
    console.log('you did it!');
  }
}