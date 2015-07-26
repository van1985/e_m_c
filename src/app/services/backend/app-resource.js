/**
 * Web services factory
 */
angular.module('getResource')

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
		// BlueLevel Service (DEV environment)
		'http://emc.dev.bluelevel.co.uk/Services/ServiceProviders.asmx/:resource/',
		// EMC Service Production
		//'https://cspdb.emc.com/Services/ServiceProviders.asmx/:resource/',
		// EMC Service Development
		//'http://cspappdev01//Services/ServiceProviders.asmx/:resource/',
		{
			callback: 'JSON_CALLBACK'
		},
		{
			get:    {method: 'JSONP'},
			params: {serviceProviderId: '@serviceProviderId'}
		}
	);
}]);
