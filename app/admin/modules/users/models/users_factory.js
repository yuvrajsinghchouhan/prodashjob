var app = angular.module('quickRabbit.users');
app.factory('UsersService', UsersService);
UsersService.$inject = ['$http', '$q', 'Upload'];

function UsersService($http, $q, Upload) {

    var UsersService = {
        getAllUsers: getAllUsers,
        addUser: addUser,
        changePassword: changePassword,
        editUserCall: editUserCall,
        edit: edit,
        walletAmount: walletAmount,
        AddAddress: AddAddress,
        UserAddress: UserAddress,
        addressStatus: addressStatus,
        exportuserData: exportuserData,
        deleteUserAddress: deleteUserAddress,
        forgotpass: forgotpass,
        forgotpasssave: forgotpasssave,
        getSettings: getSettings,
        transactionsList: transactionsList,
        deleteuserList: deleteuserList

    };
    return UsersService;
    function forgotpasssave(data) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/dashboard/forgotsave',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function forgotpass(data) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/dashboard/forgotpass',
            data: { 'data': data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
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
    function getAllUsers(status, limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.status = status;
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/users/getusers',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function addUser(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/adduser',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function changePassword(currentPwdData, pwdConfirmData, value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/changePassword',
            data: {
                pwdConfirmCheck: pwdConfirmData,
                currentPwdCheck: currentPwdData,
                changeData: value
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function editUserCall(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/save',
            data: data
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function edit(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function transactionsList(id, limit, skip, sort, search) {
        console.log("id, limit, skip, sort, search", id, limit, skip, sort, search);
        //var data = { id: id };

        //var deferred = $q.defer();
        var data = {};
        data.id = id;
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/transactionsList',
            data: data
        }).success(function (data) {


            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function walletAmount(data) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/walletAmount',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function AddAddress(userid, data) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/user/addaddress',
            data: { userid: userid, data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function UserAddress(id) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/UserAddress',
            data: { id: id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function addressStatus(add_id, userid) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/user/addressStatus',
            data: { add_id: add_id, userid: userid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deleteUserAddress(add_id, userid) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/user/deleteUserAddress',
            data: { add_id: add_id, userid: userid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
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


    function deleteuserList(status, limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.status = status;
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/users/getdeletedusers',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }



}
