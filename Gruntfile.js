module.exports = function ( grunt ) {

	/**
	 * Load required Grunt tasks
	 */
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-html2js');
	// grunt.loadNpmTasks('grunt-karma');

	/**
	 * Load build configuration file
	 */
	var userConfig = require( './build.config.js' );

	/**
	 * Grunt configuration object
	 */
	var taskConfig = {
		/**
		 * Load `package.json` file
		 */
		pkg: grunt.file.readJSON("package.json"),

		/**
		 * App comment inserted at the top of compiled source files
		 */
		meta: {
			banner:
				'/**\n' +
				' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				' * <%= pkg.homepage %>\n' +
				' *\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
				' */\n'
		},

		/**
		 * Directories to delete on `grunt clean`
		 */
		clean: [
			'<%= build_dir %>',
			'<%= compile_dir %>'
		],

		/**
		 * Copies assets and JS into `build_dir`, and then to `compile_dir`
		 */
		copy: {
			build_app_assets: {
				files: [
					{
						src: [ '**' ],
						dest: '<%= build_dir %>/assets/',
						cwd: 'src/assets',
						expand: true
					}
			]
			},
			build_vendor_assets: {
				files: [
					{
						src: [ '<%= vendor_files.assets %>' ],
						dest: '<%= build_dir %>/assets/',
						cwd: '.',
						expand: true,
						flatten: true
					}
			]
			},
			build_appjs: {
				files: [
					{
						src: [ '<%= app_files.js %>' ],
						dest: '<%= build_dir %>/',
						cwd: '.',
						expand: true
					}
				]
			},
			build_vendorjs: {
				files: [
					{
						src: [ '<%= vendor_files.js %>' ],
						dest: '<%= build_dir %>/',
						cwd: '.',
						expand: true
					}
				]
			},
			compile_assets: {
				files: [
					{
						src: [ '**' ],
						dest: '<%= compile_dir %>/assets',
						cwd: '<%= build_dir %>/assets',
						expand: true
					}
				]
			}
		},

		/**
		 * Concatenates multiple source files into a single file
		 */
		concat: {
			/**
			 * Concatenates app and vendor CSS
			 */
			build_css: {
				src: [
					'<%= vendor_files.css %>',
					'<%= build_dir %>/assets/app.css'
				],
				dest: '<%= build_dir %>/assets/app.css'
			},
			/**
			 * Concatenates app and specified vendor JS
			 */
			compile_js: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [
					'<%= vendor_files.js %>',
					'module.prefix',
					'<%= build_dir %>/src/**/*.js',
					'<%= html2js.app.dest %>',
					'<%= html2js.common.dest %>',
					'module.suffix'
				],
				dest: '<%= compile_dir %>/assets/app.js'
			}
		},

		/**
		 * Annotates sources before minifying; allows skipping the array syntax
		 */
		ngmin: {
			compile: {
				files: [
					{
						src: [ '<%= app_files.js %>' ],
						cwd: '<%= build_dir %>',
						dest: '<%= build_dir %>',
						expand: true
					}
				]
			}
		},

		/**
		 * Minifies sources
		 */
		uglify: {
			compile: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
				}
			}
		},

		/**
		 * Sass compilation and uglification
		 *
		 * Only `main.scss` is listed; @import all other Sass files into `main.scss`
		 */
		sass: {
			build: {
				files: {
					'<%= build_dir %>/assets/app.css': '<%= app_files.sass %>'
				}
			},
			compile: {
				files: {
					'<%= build_dir %>/assets/app.css': '<%= app_files.sass %>'
				},
				options: {
					outputStyle: 'compressed'
				}
			}
		},

		/**
		 * Defines JS linter rules, options, and files to check
		 */
		jshint: {
			src: [
				'<%= app_files.js %>'
			],
			test: [
				'<%= app_files.jsunit %>'
			],
			gruntfile: [
				'Gruntfile.js'
			],
			options: {
				curly: true,
				immed: true,
				newcap: true,
				noarg: true,
				sub: true,
				boss: true,
				eqnull: true
			},
			globals: {}
		},

		/**
		 * Converts templates (`src/app`, `src/common`) for the AngularJS template cache
		 */
		html2js: {
			app: {
				options: {
					base: 'src/app'
				},
				src: [ '<%= app_files.atpl %>' ],
				dest: '<%= build_dir %>/templates-app.js'
			},

			common: {
				options: {
					base: 'src/common'
				},
				src: [ '<%= app_files.ctpl %>' ],
				dest: '<%= build_dir %>/templates-common.js'
			}
		},

		/**
		 * Karma configuration
		 */
		karma: {
			options: {
				configFile: '<%= build_dir %>/karma-unit.js'
			},
			unit: {
				port: 9019,
				background: true
			},
			continuous: {
				singleRun: true
			}
		},

		/**
		 * Compiles the `index.htm` file as a Grunt template
		 */
		index: {

			/**
			 * Development: JS files are added to the `<head>` of `index.htm`
			 */
			build: {
				dir: '<%= build_dir %>',
				src: [
					'<%= vendor_files.js %>',
					'<%= build_dir %>/src/**/*.js',
					'<%= html2js.common.dest %>',
					'<%= html2js.app.dest %>',
					'<%= vendor_files.css %>',
					'<%= build_dir %>/assets/app.css'
				]
			},

			/**
			 * Deployment: Build files compiled into a single JS and a single CSS file
			 */
			compile: {
				dir: '<%= compile_dir %>',
				src: [
					'<%= concat.compile_js.dest %>',
					'<%= vendor_files.css %>',
					'<%= build_dir %>/assets/app.css'
				]
			}
		},

		/**
		 * Compiles the karma template
		 */
		karmaconfig: {
			unit: {
				dir: '<%= build_dir %>',
				src: [
					'<%= vendor_files.js %>',
					'<%= html2js.app.dest %>',
					'<%= html2js.common.dest %>',
					'<%= test_files.js %>'
				]
			}
		},

		/**
		 * Execute the listed tasks when watched files change
		 */
		delta: {
			/**
			 * Live Reload: defaults to port 35729
			 */
			options: {
				livereload: true
			},

			/**
			 * Gruntfile: lint on change
			 */
			gruntfile: {
				files: 'Gruntfile.js',
				tasks: [ 'jshint:gruntfile' ],
				options: {
					livereload: false
				}
			},

			/**
			 * JS source files: lint and run unit tests on change
			 */
			jssrc: {
				files: [
					'<%= app_files.js %>'
				],
				tasks: [ 'jshint:src', 'copy:build_appjs' ]  // karma:unit:run
			},

			/**
			 * Assets: copy existing on change (NOTE: new files are not copied)
			 */
			assets: {
				files: [
					'src/assets/**/*'
				],
				tasks: [ 'copy:build_app_assets', 'copy:build_vendor_assets' ]
			},

			/**
			 * index.htm: compile on change
			 */
			html: {
				files: [ '<%= app_files.html %>' ],
				tasks: [ 'index:build' ]
			},

			/**
			 * Templates: rewrite template cache on change
			 */
			tpls: {
				files: [
					'<%= app_files.atpl %>',
					'<%= app_files.ctpl %>'
				],
				tasks: [ 'html2js' ]
			},

			/**
			 * CSS files: compile and minify on change
			 */
			sass: {
				files: [ 'src/**/*.scss' ],
				tasks: [ 'sass:build' ]
			},

			/**
			 * JS unit test file: lint and run unit tests on change
			 */
			jsunit: {
				files: [
					'<%= app_files.jsunit %>'
				],
				tasks: [ 'jshint:test' ],  // 'karma:unit:run'
				options: {
					livereload: false
				}
			}
		}
	};

	grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

	/**
	 * Ensures a clean build; compiles or copies only what was changed
	 */
	grunt.renameTask( 'watch', 'delta' );
	grunt.registerTask( 'watch', [ 'build', 'delta' ] );  // karma:unit

	/**
	 * Default task: build and compile
	 */
	grunt.registerTask( 'default', [ 'build', 'compile' ] );

	/**
	 * Gets the app ready to run for development and testing
	 */
	grunt.registerTask( 'build', [
		'clean', 'html2js', 'jshint', 'sass:build', 'concat:build_css', 'copy:build_app_assets',
		'copy:build_vendor_assets', 'copy:build_appjs', 'copy:build_vendorjs', 'index:build'
		// 'karmaconfig', 'karma:continuous'
	]);

	/**
	 * Gets the app ready for deployment
	 */
	grunt.registerTask( 'compile', [
		'sass:compile', 'copy:compile_assets', 'ngmin', 'concat:compile_js', 'uglify', 'index:compile'
	]);

	/**
	 * A utility function to get all app JS sources
	 */
	function filterForJS ( files ) {
		return files.filter( function ( file ) {
			return file.match( /\.js$/ );
		});
	}

	/**
	 * A utility function to get all app CSS sources
	 */
	function filterForCSS ( files ) {
		return files.filter( function ( file ) {
			return file.match( /\.css$/ );
		});
	}

	/**
	 * Task assembles JS and CSS source file list (based on dynamic names) into variables
	 * for the `index.htm` template, then runs compilation
	 */
	grunt.registerMultiTask( 'index', 'Process index.htm template', function () {
		var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
		var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
			return file.replace( dirRE, '' );
		});
		var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
			return file.replace( dirRE, '' );
		});

		grunt.file.copy('src/index.htm', this.data.dir + '/index.htm', {
			process: function ( contents, path ) {
				return grunt.template.process( contents, {
					data: {
						scripts: jsFiles,
						styles: cssFiles,
						version: grunt.config( 'pkg.version' )
					}
				});
			}
		});
	});

	/**
	 * Manages karma files (`karma/*`) which are compiled as Grunt templates
	 */
	grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
		var jsFiles = filterForJS( this.filesSrc );

		grunt.file.copy( 'karma/karma-unit.tpl.js', grunt.config( 'build_dir' ) + '/karma-unit.js', {
			process: function ( contents, path ) {
				return grunt.template.process( contents, {
					data: {
						scripts: jsFiles
					}
				});
			}
		});
	});

};
