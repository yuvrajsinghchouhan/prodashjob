var app = angular.module('quickRabbit.postheader');

app.factory('PostheaderService',PostheaderService);

PostheaderService.$inject = ['$http','$q', 'Upload'];

function PostheaderService($http, $q, Upload){


    var PostheaderService = {
        save:save,
        getPostheader:getPostheader,
        getPostHeaderList:getPostHeaderList
    };

    return PostheaderService;


    function getPostHeaderList(limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/postheader/list',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    }


    function getPostheader(id){
        var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/postheader/edit',
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
            url: '/postheader/save',
            data: data
        }).then(function(data){
            deferred.resolve(data);
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
