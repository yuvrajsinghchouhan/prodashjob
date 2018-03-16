var app = angular.module('quickRabbit.languages');
app.factory('languageService', languageService);
languageService.$inject = ['$http', '$q'];
function languageService($http, $q) {
    var languageService = {
        getLanguageList: getLanguageList,
        getLanguage: getLanguage,
        editlanguage: editlanguage,
        managelanguage: managelanguage,
        submitlanguageDataCall: submitlanguageDataCall,
        selectDefault: selectDefault,
        getDefault: getDefault
    };
    return languageService;

    function getLanguageList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/settings/language/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getLanguage(id) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/language/getlanguage/' + id
        }).success(function (data) {

            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function editlanguage(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/edit',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function managelanguage(value, current, limit) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/manage',
            data: { 'code': value, 'current': current, 'limit': limit }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function submitlanguageDataCall(id, data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/translation/save',
            data: { id: id, data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function selectDefault(id) {
        var data = { id: id };
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/settings/language/default/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getDefault() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/language/default'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
