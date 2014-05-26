grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-concat');

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
	
	dir: {
	  src: 'src',
	  build: 'build',
	  compile: 'bin'
	},
	
	files: {
	  src: {
	    js: ['<%= dir.src %>/**/*.js'],
		css: ['<%= dir.src %>/**/*.css']
	  },
	  build: {
	    js: ['<%= dir.build %>/**/*.js'],
		css: ['<%= dir.build %>/**/*.css']
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
      '<%= dir.build %>', 
      '<%= dir.compile %>'
    ],
	
	copy: {
      src: {
        files: [{
          src: [
		    '<%= files.src.js %>',
			'<%= files.src.css %>'
		  ],
          dest: '<%= dir.build %>/',
          cwd: '.',
          expand: true
        }]
      },
      vendor: {
        files: [
          {
            src: [
			  '<%= files.vendor.js %>',
			  '<%= files.vendor.css %>'
			],
            dest: '<%= dir.build %>/',
            cwd: '.',
            expand: true
          }
        ]
      }
    },
	
	concat: {
      js: {
        src: [ 
          '<%= files.vendor.js %>',
          '<%= files.build.js %>'
        ],
        dest: '<%= dir.compile %>/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      css: {
        src: [
          '<%= files.vendor.css %>',
          '<%= files.build.css %>'
        ],
        dest: '<%= dir.compile %>/<%= pkg.name %>-<%= pkg.version %>.css'
      }
    },
	
    index: {
      build: {
        dir: '<%= dir.build %>',
        src: [
          '<%= files.vendor.js %>',
          '<%= files.build.js %>',
          '<%= files.vendor.css %>',
		  '<%= files.build.css %>'
        ]
      },
      compile: {
        dir: '<%= dir.compile %>',
        src: [
          '<%= concat.js.dest %>',
		  '<%= concat.css.dest %>'
        ]
      }
    }
  });
  
  grunt.registerMultiTask( 'index', 'Process index.tpl.html', function () {
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
    'clean', 'copy:vendor', 'copy:src', 'index:build'
  ]);
  
  grunt.registerTask('compile', [
    'build', 'concat:css', 'concat:js', 'index:compile'
  ]);
  
  grunt.registerTask('default', ['compile']);
};