var app = angular.module('quickRabbit.pages');
app.factory('PageService',PageService);
PageService.$inject = ['$http','$q'];

function PageService($http,$q){
    var PageService = {

        getPageList:getPageList,
        submitPage:submitPage,
        editPageCall:editPageCall,
          getSetting:getSetting,
           getSubPageList:getSubPageList,
       translatelanguage:translatelanguage

    };
    return PageService;

    function getPageList(limit,skip,sort,search){
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/pages/getlist',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;

    };
     function getSubPageList(id,limit,skip,sort,search){
        var deferred = $q.defer();
        var data = {};
        data.id = id;
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/pages/getsublist',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;

    };

    function submitPage(data){
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/pages/submitmainpage',
            data:{ data:data}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function editPageCall(id){

		var data = {id:id};
        var deferred1    = $q.defer();
        $http({
            method:'GET',
            url:'/pages/getlistdropdown'
        }).success(function(data){
            deferred1.resolve(data);
        }).error(function(err){
            deferred1.reject(err);
        });
        var promise1 = deferred1.promise;

        var deferred2    = $q.defer();
        $http({
            method:'POST',
            url:'/pages/editpage',
            data:data
        }).success(function(data){
            deferred2.resolve(data);
        }).error(function(err){
            deferred2.reject(err);
        });

        var promise2 = deferred2.promise;

		return $q.all([promise1, promise2]);

    };
    function getSetting(){
        var deferred    = $q.defer();
        $http({
            method:'GET',
            url:'/subcategories/getSetting'
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    };
    function translatelanguage(){
         var deferred    = $q.defer();
        $http({
            method:'GET',
            url:'/pages/translatelanguage'
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }



}
