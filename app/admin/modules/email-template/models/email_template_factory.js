var app = angular.module('quickRabbit.emailTemplate');
app.factory('EmailTemplateService', EmailTemplateService);
EmailTemplateService.$inject = ['$http', '$q'];

function EmailTemplateService($http, $q) {
    var EmailTemplateService = {
        getTemplateList: getTemplateList,
        getTemplate: getTemplate,
        editTemplate: editTemplate
    };
    return EmailTemplateService;

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

    function getTemplate(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/email-template/edit',
            data: data
        }).success(function (data) {
            deferred.resolve([data]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function editTemplate(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/email-template/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

}
