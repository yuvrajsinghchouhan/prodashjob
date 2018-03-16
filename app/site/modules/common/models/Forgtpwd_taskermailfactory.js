var app = angular.module('Authentication');
app.factory('ForgotpwdtaskermailService', ForgotpwdtaskermailService);
function ForgotpwdtaskermailService($http, $q) {
    var ForgotpwdtaskermailService = {
        saveTaskermailpwd: saveTaskermailpwd
    };
    return ForgotpwdtaskermailService;
    function saveTaskermailpwd(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/forgotpwdmailtasker',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
