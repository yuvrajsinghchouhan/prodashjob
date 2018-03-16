var app = angular.module('quickRabbit.administrator');
app.factory('AdminsService', AdminsService);
AdminsService.$inject = ['$http', '$q', 'Upload'];

function AdminsService($http, $q, Upload) {

    var AdminsService = {

        getAllAdmins: getAllAdmins,
        addUser: addUser,
        changePassword: changePassword,
        editUserCall: editUserCall,
        edit: edit,
        getAllSubAdmins:getAllSubAdmins,

    };
    return AdminsService;

    function getAllAdmins(limit, skip, sort, search) {

        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/admins/getadmins',
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
            url: '/admins/adduser',
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
        Upload.upload({
            url: '/admins/save',
            arrayKey: '',
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
            url: '/admins/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getAllSubAdmins(limit, skip, sort, search) {
      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/admins/getsubadmins',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;
    }


}
