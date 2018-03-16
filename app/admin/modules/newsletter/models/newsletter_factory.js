var app = angular.module('quickRabbit.newsletter');
app.factory('SubscriberService',SubscriberService);
SubscriberService.$inject = ['$http','$q'];

function SubscriberService($http,$q){
    var SubscriberService = {
        getSubscriberList:getSubscriberList,
        getsubscripermail:getsubscripermail
    };
    return SubscriberService;

    function getSubscriberList(limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/newsletter/subscriber/list',
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
