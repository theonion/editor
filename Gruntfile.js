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
                'src/base.js'

                ],
          dest: 'public/<%= pkg.name %>.js'
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
    copy: {
      main: {
      files: [
        { src: 'build/onion-editor.js', dest: '../avclub/avclub/apps/cms/static/cms/js/onion-editor.js' },
        { src: 'build/onion-editor.min.js', dest: '../avclub/avclub/apps/cms/static/cms/js/onion-editor.min.js' },
      ]
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
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'uglify']);

};