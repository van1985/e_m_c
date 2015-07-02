/**
 * Build process configuration
 */
module.exports = {
	/**
	 * `build_dir` folder: contains compiled files during development
	 * `compile_dir` folder: contains completely built app for deployment
	 */
	build_dir: 'build',
	compile_dir: 'bin',

	/**
	 * Collection of app file patterns; file paths are used for build tasks config
	 *
	 * `js`: all project JS, excluding tests
	 * `ctpl`: reusable components (`src/common`) template HTML files
	 * `atpl`: main app code (`src/app`)
	 * `html`: main HTML file
	 * `sass`: main stylesheet
	 * `jsunit`: app unit tests
	 */
	app_files: {
		js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
		jsunit: [ 'src/**/*.spec.js' ],

		atpl: [ 'src/app/**/*.tpl.html' ],
		ctpl: [ 'src/common/**/*.tpl.html' ],

		html: [ 'src/index.htm' ],
		sass: 'src/sass/main.scss'
	},

	/**
	 * Collection of files used during testing only
	 */
	test_files: {
		js: [
			// 'vendor/angular-mocks/angular-mocks.js'
		]
	},

	/**
	 * Similar to `app_files` but contains vendor code patterns (`vendor/`)
	 *
	 * `vendor_files.js`: JS files to be concatenated/minified with app JS
	 * `vendor_files.css`: CSS files to be concatenated/minified with app CSS
	 * `vendor_files.assets`: assets to be copied along with app assets
	 */
	vendor_files: {
		js: [
			'vendor/es5-shim/es5-shim.min.js',
			'vendor/es5-shim/es5-sham.min.js',
			'vendor/angular/angular.min.js',
			'vendor/angular-route/angular-route.min.js',
			'vendor/angular-resource/angular-resource.min.js',
			'vendor/angular-sanitize/angular-sanitize.min.js',
			'vendor/lodash/dist/lodash.min.js',
			'vendor/hammerjs/hammer.min.js'
		],
		css: [
		],
		assets: [
			'vendor/bootstrap-sass-official/assets/fonts/bootstrap/glyphicons-halflings-regular.eot',
			'vendor/bootstrap-sass-official/assets/fonts/bootstrap/glyphicons-halflings-regular.svg',
			'vendor/bootstrap-sass-official/assets/fonts/bootstrap/glyphicons-halflings-regular.ttf',
			'vendor/bootstrap-sass-official/assets/fonts/bootstrap/glyphicons-halflings-regular.woff'
		]
	},
};
