var app = angular.module('Authentication');
app.factory('ForgotpasswordService', ForgotpasswordService);
function ForgotpasswordService($http, $q) {
    var ForgotpasswordService = {
        saveUserInfo: saveUserInfo,
        verifyemergencycontact:verifyemergencycontact,
        mailverification:mailverification
    };
    return ForgotpasswordService;
    function saveUserInfo(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/saveforgotpasswordinfo',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function verifyemergencycontact(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/mobile/verifyemergency',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function mailverification(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/mobile/mailverification',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }  
}
