module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'bin/*',
        'lib/*',
        'tasks/*',
        'test/*',
        'Gruntfile.js',
        'index.js'
      ],
      options: {}
    }
  });

  // Load plugins
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Default task(s).
  grunt.registerTask('default', [
    'jshint'
  ]);

};