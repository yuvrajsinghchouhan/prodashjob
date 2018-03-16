var app = angular.module('quickRabbit.images');

app.factory('ImagesService', ImagesService);

ImagesService.$inject = ['$http', '$q', 'Upload'];

function ImagesService($http, $q, Upload) {

    var ImagesService = {
        getImagesList: getImagesList,
        getImage: getImage,
        save: save,
        fixedHeaderSave:fixedHeaderSave,
        fixedAsideSave:fixedAsideSave,
        themecolor:themecolor
    };

    return ImagesService;

    function getImagesList(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/images/list/?sort=' + sort + '&status=' + status + '&search=' + search + '&limit=' + limit + '&skip=' + skip
        }).success(function (data) {

            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getImage(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/images/edit',
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
        Upload.upload({
            url: '/images/save',
            arrayKey: '',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

     function fixedHeaderSave(data) {
        var deferred = $q.defer();
       $http({
            method: 'POST',
            url: '/images/fixedHeaderSave',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

     function fixedAsideSave(data) {
        var deferred = $q.defer();
       $http({
            method: 'POST',
            url: '/images/fixedAsideSave',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

   function themecolor() {
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


}
