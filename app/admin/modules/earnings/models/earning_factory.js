var app = angular.module('quickRabbit.earnings');
app.factory('EarningService', EarningService);
EarningService.$inject = ['$http', '$q'];

function EarningService($http, $q) {
    var EarningService = {
        getEarningList: getEarningList,
        getTaskrearning: getTaskrearning,
        updatepayee: updatepayee,
        paidserivce: paidserivce,
        getfirsttask: getfirsttask,
        getcyclelist: getcyclelist,
        getcyclefirst: getcyclefirst
    };
    return EarningService;

    function getTaskrearning(sitedata, limit, skip, sort, search) {
        var data = {};
        data.data = sitedata;
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tasker/edit/earning',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getEarningList(limit, skip, sort, search, data) {
        var dataValue = {
            "sort": sort,
            "status": status,
            "search": search,
            "limit": limit,
            "skip": skip,
            data: data
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/earnings/list',
            data: dataValue
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatepayee(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tasker/edit/updatepayee',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function paidserivce(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/earnings/paidserivce',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getfirsttask() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/tasks/firsttask'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getcyclelist() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/earnings/cyclelist'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getcyclefirst() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/earnings/getcyclefirst'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }



}
