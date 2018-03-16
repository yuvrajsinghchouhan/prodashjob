var app = angular.module('quickRabbit.faq');
app.factory('FaqService', FaqService);

function FaqService($http, $q) {
    var FaqService = {
        getfaq: getfaq,
        // getcategoryList: getcategoryList
    };

    return FaqService;

    function getfaq() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/faq/getfaq',
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
