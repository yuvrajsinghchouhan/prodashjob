var app = angular.module('quickRabbit.experience');

app.factory('ExperienceService', ExperienceService);

ExperienceService.$inject = ['$http', '$q', 'Upload'];

function ExperienceService($http, $q, Upload) {
    var ExperienceService = {
        getExperienceList: getExperienceList,
        getExperience: getExperience,
        save: save
    };
    return ExperienceService;

    function getExperienceList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;
        $http({
            method: 'POST',
            url: '/experience/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getExperience(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/experience/edit/',
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
            url: '/experience/save',
            data: data
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
