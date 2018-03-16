var app = angular.module('quickRabbit.pages');
app.factory('CouponService', CouponService);
CouponService.$inject = ['$http', '$q'];

function CouponService($http, $q) {

    var CouponService = {
        list: list,
        edit: edit,
        submit: submit,
        userGet: userGet
    };
    return CouponService;

    function list(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/coupons/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;


    }

    function submit(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/coupons/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function edit(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/coupons/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function userGet() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/coupons/userGet',
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
}
