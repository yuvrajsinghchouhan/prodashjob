var app = angular.module('quickRabbit.pushnotification');
app.factory('messageService', messageService);
messageService.$inject = ['$http', '$q'];

function messageService($http, $q) {
    var messageService = {
        getTemplateList: getTemplateList,
        notificationTemplate: notificationTemplate,
        getNotificationemail: getNotificationemail
        // editTemplate:editTemplate
    };
    return messageService;

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



}
