var app = angular.module('quickRabbit.categories');

app.factory('CategoryService', CategoryService);

CategoryService.$inject = ['$http', '$q', 'Upload'];

function CategoryService($http, $q, Upload) {
    var CategoryService = {
        getCategoryList: getCategoryList,
        CategoryList: CategoryList,
        getsubCategoryList: getsubCategoryList,
        subCategoryList: subCategoryList,
        getCategory: getCategory,
        getsubCategory: getsubCategory,
        savecategory: savecategory,
        savesubcategory: savesubcategory,
        getSetting: getSetting
    };

    return CategoryService;

    function getCategoryList(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/categories/list/?sort=' + sort + '&status=' + status + '&search=' + search + '&limit=' + limit + '&skip=' + skip
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function CategoryList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/admin/categories/lists',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getsubCategoryList(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/subcategories/list/?sort=' + sort + '&status=' + status + '&search=' + search + '&limit=' + limit + '&skip=' + skip
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function subCategoryList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/admin/subCategories/lists',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getCategory(id) {

        var data = { id: id };

        var deferred1 = $q.defer();
        $http({
            method: 'GET',
            url: '/categories/getcatlistdropdown'
        }).success(function (data) {
            deferred1.resolve(data);
        }).error(function (err) {
            deferred1.reject(err);
        });
        var promise1 = deferred1.promise;

        var deferred2 = $q.defer();

        $http({
            method: 'POST',
            url: '/categories/edit/',
            data: data
        }).success(function (data) {
            deferred2.resolve(data);
        }).error(function (err) {
            deferred2.reject(err);
        });
        var promise2 = deferred2.promise;

        return $q.all([promise1, promise2]);
    }
    function getsubCategory(id) {
        var data = { id: id };
        var deferred1 = $q.defer();
        $http({
            method: 'GET',
            url: '/categories/getsubcatlistdropdown'
        }).success(function (data) {
            deferred1.resolve(data);
        }).error(function (err) {
            deferred1.reject(err);
        });
        var promise1 = deferred1.promise;

        var deferred2 = $q.defer();

        $http({
            method: 'POST',
            url: '/categories/edit/',
            data: data,
        }).success(function (data) {
            deferred2.resolve(data);
        }).error(function (err) {
            deferred2.reject(err);
        });
        var promise2 = deferred2.promise;

        return $q.all([promise1, promise2]);
    }

    function savecategory(data) {
        console.log("<<<<<<<model>>>>>>>>>>>")
        console.log(data)
        console.log("<<<<<<<model>>>>>>>>>>>")
        var deferred = $q.defer();
        Upload.upload({
            url: '/categories/savecategory',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function savesubcategory(data) {
        var deferred = $q.defer();
        Upload.upload({
            url: '/categories/savesubcategory',
            data: data,
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getSetting() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/subcategories/getSetting'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
