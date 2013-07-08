module.exports = function(grunt) {
  var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
          separator: ';',
          banner: banner
        },        
        dist: {
          src: ['src/lib/keymaster.js',
                'src/base.js',
                'src/modules/toolbar.js',
                'src/plugins/richText.js',
                'src/plugins/textReplacement.js',
                ],
          dest: 'build/<%= pkg.name %>.js'
        }

    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'src/*/*.js'],
        tasks: ['concat', 'uglify'],
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};