var app = angular.module('quickRabbit.sliders');

app.factory('SliderService',SliderService);

SliderService.$inject = ['$http','$q', 'Upload'];

function SliderService($http, $q, Upload){


    var SliderService = {
        getSliderList:getSliderList,
        getSlider:getSlider,
        save:save
    };

    return SliderService;

    function getSliderList(limit,skip,sort,search){
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/admin/slider/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getSlider(id){
		var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/slider/edit',
			data:data
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function save(data){
        var deferred    = $q.defer();
		Upload.upload({
            url: '/slider/save',
            data: data,
        }).then(function(data){
            deferred.resolve(data);
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
