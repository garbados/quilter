var options = {
      good: {
        mount: 'demo',
        remote: 'http://localhost:5984/quilt',
      },
      bad: {
        mount: '...',
        remote: 'git://derp:omg@omg.github.derp/reveal'
      }
    };

module.exports = {
  options: options,
  server: require('./server')
};