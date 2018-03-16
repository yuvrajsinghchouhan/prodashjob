var app = angular.module('quickRabbit.category');
app.factory('CategoryService', CategoryService);

function CategoryService($http, $q) {
    var categoryService = {
        getcategory: getcategory,
        getcategoryList: getcategoryList
    };

    return categoryService;
    
    function getcategory(data, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            var skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/category/getcategory',
            data: { slug: data, skip: skip, itemsCount: itemsPerPage }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getcategoryList(data, page, itemsPerPage) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/category/getCategoryList'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

}
