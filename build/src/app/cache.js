/**************************************************************************************************/
// Author: lvanden
// Date: 02/07/2015
//Cache Filter
/**************************************************************************************************/

angular.module('appFilters')
    .service('CacheSrv',function($rootScope) { 

    var service= {},
        selectFilterKeysOptions = [
        "service_offering", // select
        "tier",  // select
        "market", //  select
        "cloud_hq_location", // select
        "cloud_hq_location_1", //select
        "cloud_hq_location_2", //select
        "emc_product", // select
        "service_type", // select
        "geographical", // select
        "geographical_1", // select
        "datacenter_location", // select
        "datacenter_location_1", //select
        "datacenter_location_2", //select
        "theater", //checkbox - special case: fix issue
        "theater_1", //checkbox - special case: fix issue
        "theater_2" //checkbox - special case: fix issue
        ];


    service.addFilterCache = function(filter,option){

        var filterObject={
            filter: filter,
            option: option
        };
        //Ex. filter.id === 'tier'  || option.id === 'platinum'
        if ( !localStorage.getItem(filter.id)){
            localStorage.setItem(filter.id, JSON.stringify(filterObject));
        }
        else{
            if (!localStorage.getItem(filter.id+'_1')){
                localStorage.setItem(filter.id+'_1', JSON.stringify(filterObject));
            }
            else{
                localStorage.setItem(filter.id+'_2', JSON.stringify(filterObject));
            }
        }
    };

    service.addGenericItemCache = function(key,data){
          localStorage.setItem(key, JSON.stringify(data));
    };

    service.getGenericCacheData = function(key){
        return localStorage.getItem(key);
    };

    //Logic - If is parent parent_idx = 0
    //Logic - If is first child parent_idx =1  
    service.getFilterCache = function(keyFilter){
        var filter = localStorage.getItem(keyFilter);
        
        if (filter){
            var id=0; //is parent
            if (keyFilter.indexOf('_1') > 0){
                id=1; //is first child
            }
            if (keyFilter.indexOf('_2') > 0){
                id=2; //is second child
            }
            filter = JSON.parse(filter);
            filter.parent_idx = id;
            filter = JSON.stringify(filter);
        }
        return filter;
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
        //service.addGenericItemCache('data',TransferObject.data);
    });

    //TODO: Not best practice - Low performance. 
    $rootScope.$on('removeFilterCache', function (event, filter_id) {
         service.removeFilterCache(filter_id);
    });

    //TODO: Not best practice - Low performance. 
    $rootScope.$on('resetFilterCache',function() {
         service.cleanFilterCache();
    });

        //TODO: Not best practice - Low performance. 
    $rootScope.$on('updateCacheData',function (event,data) {
         var TransferObject = JSON.parse(data);
         service.addGenericItemCache('data',TransferObject.data);
    });

    return service;           
});
