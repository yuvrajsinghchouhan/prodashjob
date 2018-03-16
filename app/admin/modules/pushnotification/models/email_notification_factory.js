var app = angular.module('quickRabbit.pushnotification');
app.factory('emailService', emailService);
emailService.$inject = ['$http', '$q'];

function emailService($http, $q) {
    var emailService = {
        getTemplateList: getTemplateList,
        editnotificationTemplate: editnotificationTemplate,
        getNotificationemail: getNotificationemail,
        getmessagetemplate:getmessagetemplate,
        getmailtemplate:getmailtemplate
    };
    return emailService;

    function getTemplateList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/email-template/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getNotificationemail(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/notification/email-template/edit',
            data: data
        }).success(function (data) {
            deferred.resolve([data]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function editnotificationTemplate(data) {
       var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/notification/email-template/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getmailtemplate() {
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
    };

    function getmessagetemplate() {
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
    };

}
