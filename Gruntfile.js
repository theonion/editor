module.exports = function(grunt) {
  var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';

    
  // Configure Grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          mainConfigFile: 'build.js'
        }
      }
    },
    watch: {
      tasks: ['requirejs']
    }
    
  });
  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Make task shortcuts
  grunt.registerTask('default', 'requirejs');
};