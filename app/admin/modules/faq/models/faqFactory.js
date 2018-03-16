var app = angular.module('quickRabbit.faq');

app.factory('FaqService',FaqService);

FaqService.$inject = ['$http','$q', 'Upload'];

function FaqService($http, $q, Upload){
    var FaqService = {
        getFaqList:getFaqList,
        getFaq:getFaq,
        save:save
    };

    return FaqService;

    function getFaqList(limit,skip,sort,search){

      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/faq/list/',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    }

    function getFaq(id){
		var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/faq/edit/',
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
            url: '/faq/save',
            data: data,
        }).then(function(data){
            deferred.resolve(data);
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
