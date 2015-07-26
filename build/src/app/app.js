/**
 * Main application module
 */
angular.module('emc_service_providers', [
	'ngRoute',
	'getResource',
	'appFilters',
	'Controllers',
	'Services',
	'angular-ui.dropdown',
	'angular-ui.tabs',
	'angular-ui.buttons',
	'angular-ui.typeahead',
	'angular-ui.popover',
	'angular-ui.tooltip',
	'angular-ui.modal',
	'angular-ui.scrollfix',
	'templates-app',
	'templates-common',
	'hmTouchEvents'
])

/**
 * Sets up routing, configures AngularUI tooltip (for provider detail)
 */
.config(['$locationProvider', '$routeProvider', '$tooltipProvider',
	function($locationProvider, $routeProvider, $tooltipProvider) {

	$locationProvider.html5Mode(true);

	$routeProvider
		.when()
		.otherwise({
			templateUrl: 'home.tpl.html',
			controller: 'MainCtrl',
			reloadOnSearch: false
		});

	$tooltipProvider
		.setTriggers({
			'mouseenter': 'mouseleave',
			'click':      'click',
			'focus':      'blur',
			'never':      'mouseleave',
			'show':       'hide'
		});
}])
.run(function() {

});

//Define angular Modules
angular.module('getResource', ['ngResource']);
angular.module('appFilters', ['ngSanitize']);
angular.module('Controllers',[]);
angular.module('Services',[]);