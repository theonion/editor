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
      scripts: {
        files: ['src/*.js', 'src/*/*.js'],
        tasks: ['requirejs'],
      }
    }


  });
  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', 'requirejs');

};