/**
 * Web services factory
 */
angular.module('getResource', [
	'ngResource'
])

/**
 * Fetches application data from BlueLevel backend.
 *
 * @param  {function} $resource AngularJS RESTful service provider.
 * @param  {function} $q        AngularJS promise service.
 * @param  {function} $timeout  AngularJS wrapper for window.setTimeout.
 * @return {object}   $resource API call results.
 */
.factory('getResource', ['$resource', '$q', '$timeout', function($resource, $q, $timeout) {
	return $resource(
		'https://cspdb.emc.com/Services/ServiceProviders.asmx/:resource/',
		{
			callback: 'JSON_CALLBACK'
		},
		{
			get:    {method: 'JSONP'},
			params: {serviceProviderId: '@serviceProviderId'}
		}
	);
}]);
