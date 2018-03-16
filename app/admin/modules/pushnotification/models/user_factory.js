var app = angular.module('quickRabbit.pushnotification');
app.factory('UsernotificationService',UsernotificationService);
UsernotificationService.$inject = ['$http','$q'];

function UsernotificationService($http,$q){
    var UsernotificationService = {
        getUserList:getUserList,
        // getsubscripermail:getsubscripermail
    };
    return UsernotificationService;

    function getUserList(limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/notification/user/list/',
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
