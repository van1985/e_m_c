/**************************************************************************************************/
// Author: Globant
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
        "public_sector",
        "contract_type",
        "emc_certified_cloud"
        ];

    service.getKeysFilters = function(){
        return selectFilterKeysOptions;
    };

    function getGeographicalOptionsFilter(filterObject,value,parentId,optionsFilter){
        //Only Geographical option
        /*
        // this hardcoded style is repeated in 3 methods
        // consider change them too
        // is higly brittle and harde to maintain

        if (value==='ams' || value==='apj'|| value==='emea') {
            return filterObject.filter.options[0];
        }else
        {
            if (parentId ==='apj')
                {return optionsFilter[1].apj;}
            if (parentId ==='ams')
                {return optionsFilter[1].ams;}
            if (parentId ==='emea')
                {return optionsFilter[1].emea;}
        }*/

        //////////////////

        var output = []; // set here whatever is the default for unmatched lookup

        // zone (value is a zone name?)
        if (optionsFilter[1].hasOwnProperty(value)){ // instead of comparison check for existance (value==='ams' || value==='apj'|| value==='emea')
            output = optionsFilter[0];
        }

        // country by zone (parent is a zone Name and it is in zones hash optionsFilter[1]?)
        else if (optionsFilter[1].hasOwnProperty(parentId)){ // instead of comparison check for existance (parentId==='ams' || parentId==='apj'|| parentId==='emea')
            output = optionsFilter[1][parentId];
        }

        // state by country (parent is a country Name and it is in contries hash optionsFilter[2]? )
        else if (optionsFilter[2].hasOwnProperty(parentId)){ //
            output = optionsFilter[2][parentId];
        }

        return output;

    }

    function getCloudHqLocationOptionsFilter(filterObject,value,parentId,optionsFilter){
        //Only Geographical option
        if (value==='ams' || value==='apj'|| value==='emea') {
            return filterObject.filter.options[0];
        }else
        {
            if (parentId ==='apj')
                {return optionsFilter[1].apj;}
            if (parentId ==='ams')
                {return optionsFilter[1].ams;}
            if (parentId ==='emea')
                {return optionsFilter[1].emea;}

            if (parentId === 'aus')
                {return optionsFilter[2].aus;}
            if (parentId === 'bra')
                {return optionsFilter[2].bra;}
            if (parentId === 'can')
                {return optionsFilter[2].can;}
            if (parentId === 'mex')
                {return optionsFilter[2].mex;}
            if (parentId === 'usa')
                {return optionsFilter[2].usa;}
        }
    }


    function getDataCenterLocationOptionsFilter(filterObject,value,parentId,optionsFilter){
        //Only Geographical option
        if (value==='ams' || value==='apj'|| value==='emea') {
            return filterObject.filter.options[0];
        }else
        {
            if (parentId ==='apj')
                {return optionsFilter[1].apj;}
            if (parentId ==='ams')
                {return optionsFilter[1].ams;}
            if (parentId ==='emea')
                {return optionsFilter[1].emea;}

            if (parentId === 'aus')
                {return optionsFilter[2].aus;}
            if (parentId === 'bra')
                {return optionsFilter[2].bra;}
            if (parentId === 'can')
                {return optionsFilter[2].can;}
            if (parentId === 'mex')
                {return optionsFilter[2].mex;}
            if (parentId === 'usa')
                {return optionsFilter[2].usa;}
        }
    }

    service.getFilter = function(key,value,filters){
        var filterObject = {
            filter: '',
            option: []
        },
        values=[];
        //Parse values to an array
        if (value.indexOf(',')<0){
            values.push(value);
        }
        else{
            values = value.split(',');
        }

        //get Filter object
        for (var i = 0, len = filters.length; i < len; i++) {

            //Case Select Simple and checkbox (Public Sector & Credit Card) -> NOT THEATER: Multiple checkbox
            if (  filters[i].id === key){
                filterObject.filter = filters[i];
                var parentId = null;
                for (var j=0, len2 = values.length; j < len2; j++){
                    var optionsFilter =filterObject.filter.options;
                    //Only Geographical option
                    if (filterObject.filter.id === 'geographical'){
                        optionsFilter = getGeographicalOptionsFilter(filterObject,values[j],parentId,optionsFilter);
                        parentId = values[j];
                    }
                    console.log(parentId);
                    //Only cloud hq location
                    if (filterObject.filter.id === 'cloud_hq_location'){
                        optionsFilter = getCloudHqLocationOptionsFilter(filterObject,values[j],parentId,optionsFilter);
                        parentId = values[j];
                    }
                    //Only cloud hq location
                    if (filterObject.filter.id === 'datacenter_location'){
                        optionsFilter = getDataCenterLocationOptionsFilter(filterObject,values[j],parentId,optionsFilter);
                        parentId = values[j];
                    }
                    var result = _.where(optionsFilter, {id: values[j]});
                    if (result){
                        filterObject.option.push(result[0]);
                    }
                }
            }
        }
        return filterObject;
    };

    return service;           
});
