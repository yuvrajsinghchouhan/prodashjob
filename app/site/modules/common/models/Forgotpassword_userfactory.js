var app = angular.module('Authentication');
app.factory('ForgotpwduserService', ForgotpwduserService);
function ForgotpwduserService($http, $q) {
    var ForgotpwduserService = {
        saveUserInfopwd: saveUserInfopwd,
        otpsave:otpsave,
        resendotp:resendotp,
        getuserdata:getuserdata,
        activateUserAccount:activateUserAccount
    };
    return ForgotpwduserService;
    function saveUserInfopwd(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/saveforgotpwduser',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function otpsave(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/otpsave',
            data:  data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function resendotp(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/resendotp',
            data: { 'data': data }
        }).success(function (data) {

            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


        function getuserdata(data) {
          console.log(data);
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/site/getuserdata',
                data:  {data:data}
            }).success(function (data) {
                deferred.resolve(data);
            }).error(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        function activateUserAccount(data) {
          console.log(data);
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/site/activateUserAccount',
                data: data
            }).success(function (data) {
                deferred.resolve(data);
            }).error(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

}
