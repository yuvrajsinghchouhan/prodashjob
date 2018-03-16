var app = angular.module('quickRabbit.currencies');
app.factory('CurrencyService', CurrencyService);
CurrencyService.$inject = ['$http', '$q'];

function CurrencyService($http, $q) {
    var CurrencyService = {

        getProductList: getProductList,
        getCurrency: getCurrency,
        save: save,
        selectDefault: selectDefault,
        getDefault: getDefault

    };
    return CurrencyService;
    function getProductList(limit, skip, sort, search) {
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/settings/currency/list',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;
    };

    function getCurrency(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/currency/edit',
            data: data
        }).success(function (data) {

            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    function save(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/currency/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function selectDefault(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/currency/default/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getDefault() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/currency/default'
        }).success(function (data) {

            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };


}
