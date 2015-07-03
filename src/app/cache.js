/**************************************************************************************************/
// Author: lvanden
// Date: 02/07/2015
//Cache Filter
/**************************************************************************************************/

angular.module('appFilters')
    .service('CacheSrv',function($rootScope) { 

    var service= {},
        selectFilterKeysOptions = [
        "service_offering", 
        "tier", 
        "theater", // not working - checkbox
        "market", // working ok - select
        "cloud_hq_location", //not working - select
        "emc_product", // not working - select
        "service_type", //not working - select
        "geographical", //not working - select
        "datacenter_location", //not working - select
        "credit_card_swipe", //not working - checkbox
        "public_sector" //not working - checkbox

        ];


    service.addFilterCache = function(filter,option){

        var filterObject={
            filter: filter,
            option: option
        };
        //Ex. filter.id === 'tier'  || option.id === 'platinum'
        localStorage.setItem(filter.id, JSON.stringify(filterObject));
    };

    service.addGenericItemCache = function(key,data){
          localStorage.setItem(key, JSON.stringify(data));
    };

    service.getFilterCache = function(keyFilter){
        return localStorage.getItem(keyFilter);
    };

    service.removeFilterCache = function(filter){
        localStorage.removeItem(filter.id);
    };

    service.cleanFilterCache = function(){
        localStorage.clear();
    };

    service.init = function(queryParameter){

        var initObject = {
            data: '',
            filters: []
        };

        //More performance with for than with arr.forEach
        if (!jQuery.isEmptyObject(queryParameter)){
            var data = service.getFilterCache('data');
            initObject.data = JSON.parse(data);
            for (var i = 0, len = selectFilterKeysOptions.length; i < len; i++) {
                var filterObject =  service.getFilterCache( selectFilterKeysOptions[i]);
                filterObject = JSON.parse(filterObject);
                if (filterObject){
                    initObject.filters.push(filterObject);
                }
            }
        }
        else{
            service.cleanFilterCache();
            return null;
        }
        return initObject;
    };


    //TODO: Not best practice - Low performance. 
    // Data - object
    /* var transferObject={
                data: $scope.data,
                filter: filter,
                option: option
            };
    */
    $rootScope.$on('addFilterCache', function (event, data) {
        var TransferObject = JSON.parse(data);
        service.addFilterCache(TransferObject.filter, TransferObject.option);
        service.addGenericItemCache('data',TransferObject.data);
    });

    //TODO: Not best practice - Low performance. 
    $rootScope.$on('removeFilterCache', function (event, filter_id) {
         service.removeFilterCache(filter_id);
    });

    //TODO: Not best practice - Low performance. 
    $rootScope.$on('resetFilterCache',function() {
         service.cleanFilterCache();
    });

    return service;           
});
