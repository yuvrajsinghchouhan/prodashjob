var app = angular.module('quickRabbit.category');
app.factory('ContactService', ContactService);

function ContactService($http, $q) {
    var ContactService = {

		    savemessage:savemessage
    };

    return ContactService;

    function savemessage(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/contact/savecontactusmessage',
            data : data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
