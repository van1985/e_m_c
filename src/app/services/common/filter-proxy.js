angular.module('Services')
	.service('FilterProxySrv', function () {

		var service= {},
		secondaryFilters = [];

		/**
		 * Fill secondaryFilters array with all the secondary filters
		 * (parent !== null) that come from backend
		 * @param {filters}  
		 * @return {null} - not return
		 */
		service.initFilterProxy = function(filters){

		};

		/**
		 * Evaluate if the filter is primary or secondary from internal array
		 * @param {filter}
		 * @return {Boolean}
		 */
		service.isSecondaryFilter = function(filter){

		};

	return service;
});