var app = angular.module('quickRabbit.dashboard');
app.factory('DashboardService', DashboardService);
DashboardService.$inject = ['$http', '$q'];

function DashboardService($http, $q) {
    var DashboardService = {
        getAllUsers: getAllUsers,
        getTaskers: getTaskers,
        getTasks: getTasks,
        getdefaultcurrency: getdefaultcurrency,
        getCategoryList: getCategoryList,
        getStatisticsGraph: getStatisticsGraph,
        getPieChartShops: getPieChartShops,
        getRecentTaskers: getRecentTaskers,
        getRecentTasks: getRecentTasks,
        getRecentUsers: getRecentUsers,
        getTaskDetails: getTaskDetails,
        getTaskerDetails: getTaskerDetails,
        deleteUser: deleteUser,
        approvTasker: approvTasker,
        earningsDetails: earningsDetails,
        getAllearnings: getAllearnings,
        getverifiedTaskerDetails:getverifiedTaskerDetails
    };

    return DashboardService;

    function getAllearnings(data, status) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/getAllearnings'
            // data: {}
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
    function approvTasker(data, status) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/dashboard/approvtasker',
            data: { "data": data, "status": status }
        }).then(function (data) {

            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
    function deleteUser(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/dashboard/deleteUser',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getRecentUsers(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/userlist'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getRecentTasks(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/tasks/recenttasklist/?sort=' + sort + '&status=' + status + '&search=' + search + '&limit=' + limit + '&skip=' + skip
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getStatisticsGraph() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/getstatistics'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getPieChartShops() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/getpiechartshops'
        }).success(function (data) {
            deferred.resolve(data[0]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;

    }
    function getAllUsers() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/getusers'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getRecentTaskers(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/taskers/getrecenttasker/?sort=' + sort + '&status=' + status + '&search=' + search + '&limit=' + limit + '&skip=' + skip
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getTaskers() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/taskers/gettaskers'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getTasks(seller) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tasks/list',
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getCategoryList() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/categories/list'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function listUser() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/users/usersList'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getTaskDetails(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/tasklist'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getTaskerDetails(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/taskerlist'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

     function getverifiedTaskerDetails(limit, skip, sort, status, search) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/dashboard/verified/taskerlist'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function earningsDetails() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/dashboard/earningsDetails'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getdefaultcurrency() {
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
    }


}
