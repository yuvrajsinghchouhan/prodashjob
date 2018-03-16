var app = angular.module('quickRabbit.admin');
app.factory('MainService', MainService);
function MainService($http, $q) {
    var mainService = {};
    mainService.currentValue = '';
    mainService.sortedArray = [];

    mainService.getCurrentUsers = function (username) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/admins/currentuser',
            data: {
                'currentUserData': username
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.getShopList = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/shops/list'
        }).success(function (data) {
            deferred.resolve(data.length);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    mainService.getTaskerPendingList = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/taskers/plist'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.getmailtemplate = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/notification/email-template/getmailtemplate'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    mainService.getmessagetemplate = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/notification/email-template/getmessagetemplate'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    mainService.getCurrentUserValue = function () {
        return mainService.currentValue;
    };

    mainService.setCurrentUserValue = function (value) {
        mainService.currentValue = value;
    };

    mainService.setMenu = function (menus) {
        mainService.menus = menus;
    };

    mainService.getMenu = function () {
        return mainService.menus;
    };

    mainService.getSortedArray = function () {
        return mainService.sortedArray;
    };

    mainService.setSortedArray = function (value) {
        mainService.sortedArray = value;
    };

    mainService.deleteDataCall = function (url, value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: url,
            data: { delData: value }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    mainService.menu = function () {
        var deferred = $q.defer();
        $http.get('app/admin/public/asserts/json/menu.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.settings = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/general'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    mainService.themecolor = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/themecolor'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.language = function () {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/default'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.currency = function () {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/currency/default'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.sendbulkmail = function (delvalue, template) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/newsletter/sendbulkmail',
            data: { delvalue: delvalue, template: template }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.sendmessage = function (delvalue, template, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/newsletter/sendmessage',
            data: { delvalue: delvalue, template: template, type: type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.sendmessagemail = function (delvalue, template, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/newsletter/sendmessagemail',
            data: { delvalue: delvalue, template: template, type: type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    mainService.getImage = function () {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/images/admin-Image'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    return mainService;
}
