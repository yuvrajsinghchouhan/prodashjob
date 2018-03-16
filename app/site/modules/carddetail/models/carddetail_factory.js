var app = angular.module('quickRabbit.carddeatil');
app.factory('CarddetailService', CarddetailService);

function CarddetailService($http, $q) {
    var carddetailService = {
        gettaskbyid: gettaskbyid,
        confirmtask: confirmtask,
        walletpayment: walletpayment,
        applyCoupon: applyCoupon,
        removeCoupon: removeCoupon,
        paypalPayment:paypalPayment,
        paymentmode:paymentmode,
        couponCompletePayment:couponCompletePayment,
        remitaPayment:remitaPayment
    };
    return carddetailService;
    function gettaskbyid(taskid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/gettaskbyid',
            data: { task: taskid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function confirmtask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/confirmtask',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function paypalPayment(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/paypalPayment',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function walletpayment(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/paybywallet',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

     function couponCompletePayment(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/couponCompletePayment',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function applyCoupon(data) {
	     //console.log("data",data);
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/apply-coupon',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function removeCoupon(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/remove-coupon',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function paymentmode() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/paymentmode'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function remitaPayment(data) {
          var deferred = $q.defer();
          $http({
              method: 'POST',
              url: '/site/account/remitaPayment',
              data: data
          }).success(function (data) {
            //console.log('factoryresponse',data);
              deferred.resolve(data);
          }).error(function (err) {
              deferred.reject(err);
          });
          return deferred.promise;
      }

}
