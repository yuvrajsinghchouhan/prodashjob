var app = angular.module('quickRabbit.pushnotification');
app.factory('TaskernotificationService',TaskernotificationService);
TaskernotificationService.$inject = ['$http','$q'];

function TaskernotificationService($http,$q){
    var TaskernotificationService = {
        getTaskerList:getTaskerList,
        // getsubscripermail:getsubscripermail
    };
    return TaskernotificationService;

    function getTaskerList(limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/notification/tasker/list/',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;
    };

    function getsubscripermail() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/emailtemplate/getsubscripermail'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

}
