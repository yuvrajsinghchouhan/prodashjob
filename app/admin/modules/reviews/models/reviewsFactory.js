var app = angular.module('quickRabbit.reviews');

app.factory('ReviewsService', ReviewsService);

ReviewsService.$inject = ['$http', '$q', 'Upload'];

function ReviewsService($http, $q, Upload) {


    var ReviewsService = {
        getReviewsList: getReviewsList,
        getReviews: getReviews,
        save: save
    };

    return ReviewsService;

    function getReviewsList(type,limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.type=type;
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/reviews/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getReviews(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/reviews/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function save(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/reviews/save',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
