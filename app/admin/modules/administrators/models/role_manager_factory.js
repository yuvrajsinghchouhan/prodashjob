var app = angular.module('quickRabbit.administrator');

app.factory('RoleManagerService', RoleManagerService);

RoleManagerService.$inject = ['$http', '$q'];

function RoleManagerService($http, $q) {

    var RoleManagerService = {
        getMenuList: getMenuList,
        getAllUsersRole: getAllUsersRole,
        RoleManagerActionCall: RoleManagerActionCall
    };

    return RoleManagerService;

    function getMenuList() {
        var deferred = $q.defer();
        $http.get('app/admin/public/asserts/json/privilages.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getAllUsersRole(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url   : '/admins/getusersrole',
            data  : {data:data}
        }).success(function (data) {
            deferred.resolve(data, data.length);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function RoleManagerActionCall(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/admins/rolemanager',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
