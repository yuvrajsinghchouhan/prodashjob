var app = angular.module('quickRabbit.paymentGateway');
app.factory('PaymentGatewayService', PaymentGatewayService);
PaymentGatewayService.$inject = ['$http', '$q'];

function PaymentGatewayService($http, $q) {

    var PaymentGatewayService = {

        list:list,
        edit:edit,
        save:save

    };
    return PaymentGatewayService;

	// Get List Of Payment Gateway
    function list(limit,skip,sort,search) {
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/paymentGateway/list',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    };

	// Edit Payment Gateway
	function edit(id) {
		var data={id:id}
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/paymentGateway/edit',
			data: data
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    };

	// Save Payment Gateway
    function save(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/paymentGateway/save',
            data: data
        }).success(function(data) {
            deferred.resolve(data);
        }).error(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

}
