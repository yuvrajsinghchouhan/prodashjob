var app = angular.module('quickRabbit.becometasker');
app.factory('BecomeTaskerService', BecomeTaskerService);
function BecomeTaskerService($http, $q) {
    var BecomeTaskerService = {
        checkemail: checkemail
    };

    return BecomeTaskerService;

    function checkemail(email) {
        var deferred = $q.defer();
        $http({
            method: 'post',
            url: '/site/users/checktaskeremail',
            data: { email: email }
        }).success(function (response) {

            deferred.resolve(response);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

};
