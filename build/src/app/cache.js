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
        "emc_product", // select
        "service_type", // select
        "geographical", // select
        "datacenter_location", // select
        "theater", //checkbox - special case: fix issue
        "credit_card_swipe",
        "public_sector"
        ];

    service.getKeysFilters = function(){
        return selectFilterKeysOptions;
    };

    service.getFilter = function(key,value,filters){
        var filterObject = {
            filter: '',
            option: []
        };
        for (var i = 0, len = filters.length; i < len; i++) {

            //Case Select Simple and checkbox (Public Sector & Credit Card) -> NOT THEATER: Multiple checkbox
            if (  ( filters[i].form_type === 'select' ||  filters[i].form_type === 'checkbox')  && filters[i].id === key){
                filterObject.filter = filters[i];
                for (var j=0, len2 = filters[i].options.length; j < len2; j++){
                    if ( filters[i].options[j].id === value ){
                        filterObject.option.push(filters[i].options[j]);
                    }
                }
            }
        }
        return filterObject;
    };

    return service;           
});
