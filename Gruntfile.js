var matchdep = require('matchdep');

module.exports = function (grunt) {
  matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    dir: {
      src: 'src',
      deb: 'build',
      rel: 'dist'
    },

    files: {
      src: {
        js: ['<%= dir.src %>/**/*.js'],
        css: ['<%= dir.src %>/**/*.css']
      },
      deb: {
        js: ['<%= dir.deb %>/**/*.js'],
        css: ['<%= dir.deb %>/**/*.css']
      },
      vendor: {
        js: [
          'bower_components/**/*.js',
          '!bower_components/**/*.min.js'
        ],
        css: ['bower_components/**/*.css']
      }
    },

    clean: [ 
      '<%= dir.deb %>', 
      '<%= dir.rel %>'
    ],

    copy: {
      src: {
        files: [{
          src: [
            '<%= files.src.js %>',
            '<%= files.src.css %>'
          ],
          dest: '<%= dir.deb %>/',
          cwd: '.',
          expand: true
        }]
      },
      vendor: {
        files: [{
          src: [
            '<%= files.vendor.js %>',
            '<%= files.vendor.css %>'
          ],
          dest: '<%= dir.deb %>/',
          cwd: '.',
          expand: true
        }]
      }
    },

    concat: {
      js: {
        src: [ 
          '<%= files.vendor.js %>',
          '<%= files.deb.js %>'
        ],
        dest: '<%= dir.rel %>/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      css: {
        src: [
          '<%= files.vendor.css %>',
          '<%= files.deb.css %>'
        ],
        dest: '<%= dir.rel %>/<%= pkg.name %>-<%= pkg.version %>.css'
      }
    },

    index: {
      deb: {
        dir: '<%= dir.deb %>',
        src: [
          '<%= files.vendor.js %>',
          '<%= files.deb.js %>',
          '<%= files.vendor.css %>',
          '<%= files.deb.css %>'
        ]
      },
      rel: {
        dir: '<%= dir.rel %>',
        src: [
          '<%= concat.js.dest %>',
          '<%= concat.css.dest %>'
        ]
      }
    }
  });

  grunt.registerMultiTask('index', 'Process index.tpl.html', function () {
    var dirRE = new RegExp('^' + this.data.dir + '\/');

    var jsFiles = this.filesSrc.filter(function (file) {
      return file.match(/\.js$/);
    }).map(function (file) {
      return file.replace(dirRE, '');
    });

    var cssFiles = this.filesSrc.filter(function (file) {
      return file.match(/\.css$/);
    }).map(function (file) {
      return file.replace(dirRE, '');
    });

    grunt.file.copy('src/index.tpl.html', this.data.dir + '/index.html', { 
      process: function (contents, path) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles
          }
        });
      }
    });
  });

  grunt.registerTask('build', [
    'clean', 'copy:vendor', 'copy:src', 'index:deb'
  ]);

  grunt.registerTask('compile', [
    'build', 'concat:css', 'concat:js', 'index:rel'
  ]);

  grunt.registerTask('default', ['compile']);
};
