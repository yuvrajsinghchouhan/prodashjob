var app = angular.module('Authentication');
app.factory('ForgotpwdusermailService', ForgotpwdusermailService);
function ForgotpwdusermailService($http, $q) {
    var ForgotpwdusermailService = {
        saveUsermailpwd: saveUsermailpwd
    };
    return ForgotpwdusermailService;
    function saveUsermailpwd(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/forgotpwdmailuser',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
