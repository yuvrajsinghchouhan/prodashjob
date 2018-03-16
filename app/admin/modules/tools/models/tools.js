var app = angular.module('quickRabbit.tools');
app.factory('ToolsService', ToolsService);
ToolsService.$inject = ['$http', '$q'];

function ToolsService($http, $q, Upload) {
    var ToolsService = {
        exportData: exportData,
        exportuserData: exportuserData,
        exporttaskerData: exporttaskerData,
        exportTransactionData: exportTransactionData,
        getSettings: getSettings
    };
    return ToolsService;

	   function exportData() {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tools/taskexport'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function exportuserData() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tools/exportuser'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };


    function exporttaskerData() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tools/exporttasker'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };



    function exportTransactionData() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tools/exportTransactionData'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getSettings() {
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
}
