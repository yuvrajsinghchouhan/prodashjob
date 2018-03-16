var app = angular.module('quickRabbit.contactus');

app.factory('ContactService', ContactService);

ContactService.$inject = ['$http', '$q', 'Upload'];

function ContactService($http, $q, Upload) {

    var ContactService = {
        getContactList: getContactList,
        getContact: getContact,
        sendMail:sendMail,
        //save: save
    };
    return ContactService;

    function getContactList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/contact/list/',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getContact(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/contact/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    /*

    function save(data) {
        var deferred = $q.defer();
        Upload.upload({
            url: '/contact/save',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    */
    function sendMail(data) {
        var deferred = $q.defer();
        Upload.upload({
            url: '/contact/sendMail',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
