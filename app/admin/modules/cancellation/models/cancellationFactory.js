var app = angular.module('quickRabbit.cancellation');

app.factory('cancellationService',cancellationService);

cancellationService.$inject = ['$http','$q', 'Upload'];

function cancellationService($http, $q, Upload){


    var cancellationService = {
        getCancellationList:getCancellationList,
        getCancellation:getCancellation,
        save:save

    };

    return cancellationService;



    function getCancellationList(limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/cancellation/list',
          data:data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    }

    function getCancellation(id){
		var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/cancellation/edit',
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
        $http({
            method:'POST',
            url: '/cancellation/save',
            data: data
        }).then(function(data){
            deferred.resolve(data);
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
