var mocks = require('mocks'),
    options = {
      good: {
        mount: 'demo',
        remote: 'http://localhost:5984/quilt',
      },
      bad: {
        mount: '...',
        remote: 'git://derp:omg@omg.github.derp/reveal'
      }
    },
    mockery = {
      fs: mocks.fs.create({
        'one.js': mocks.fs.file('2012-01-01'),
        'two.js': mocks.fs.file('2012-02-02'),
        'three.js': mocks.fs.file('2012-02-02')
      })
    };

module.exports = {
  options: options,
  mockery: mockery
};