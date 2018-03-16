var app = angular.module('quickRabbit.category');
app.factory('PageService', PageService);

function PageService($http, $q) {
    var PageService = {
        getpage: getpage,
    };
    return PageService;

    function getpage(slug,language) {
        var deferred = $q.defer();
        var data = {};
        data.slug = slug.slug;
        data.language = language;
        $http({
            method: 'POST',
            url: '/site/pages/getpage',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

}
