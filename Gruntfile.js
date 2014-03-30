module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'bin/*',
        'lib/*',
        'src/*',
        'tasks/*',
        'test/*',
        'Gruntfile.js',
        'index.js'
      ],
      options: {}
    },
    jscoverage: {
      options: {
        inputDirectory: 'src',
        outputDirectory: 'src-cov'
      }
    },
    simplemocha: {
      options: {},

      all: { src: ['test/**/*.js'] }
    }
  });

  // Load plugins
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Default task(s).
  grunt.registerTask('default', [
    'jshint',
    'jscoverage',
    'simplemocha'
  ]);

};