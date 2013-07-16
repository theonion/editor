module.exports = function(grunt) {
  var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
          separator: ';',
          banner: banner
        },        
        dist: {
          src: [
                'src/base.js',
                'src/modules/toolbar.js',
                'src/modules/formatting.js',
                'src/modules/selection.js',
                'src/modules/embed.js',

                'src/plugins/textReplacement.js',
                'src/lib/sanitize.js',
                'src/lib/keymaster.js',
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

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('default', ['concat', 'uglify']);

};