var app = angular.module('Authentication');
app.factory('AuthenticationService', AuthenticationService);
AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', 'toastr', '$q', '$cookies', 'Upload', 'socket'];

function AuthenticationService($http, $cookieStore, $rootScope, toastr, $q, $cookies, Upload, socket) {

    var service = {};

    service.taskerLogin = function (username, password, callback) {
        $http.post('/site/taskerlogin', { username: username, password: password })
            .success(function (response) {
                callback(response);
            }).error(function (err) {
                callback(err);
            });
    };

    service.userLogin = function (username, password, callback) {
        $http.post('/site', { username: username, password: password })
            .success(function (response) {
                callback(response);
            }).error(function (err) {
                toastr.error('login error', 'Error');
            });
    };

    service.facebookuser = function (facebookdata) {
        var deferred = $q.defer();
        $http({
            method: 'post',
            url: '/site/users/facebooksiteregister',
            data: { facebookdata: facebookdata }
        }).success(function (response) {
            deferred.resolve(response);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.Register = function (value, callback) {
        $http.post('/siteregister', value)
            .success(function (response) {
                callback(null, response);
            }).error(function (err) {
                callback(err, null);
            });
    };

    service.FacebookRegister = function (value, callback) {
        $http.post('/facebookregister', value)
            .success(function (response) {
                callback(null, response);
            }).error(function (err) {
                callback(err, null);
            });
    };

    service.checkreferal = function (referalcode) {
        var deferred = $q.defer();
        $http({
            method: 'post',
            url: '/site/users/checkreferal',
            data: { referalcode: referalcode }
        }).success(function (response) {

            deferred.resolve(response);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.checkemail = function (email) {
        var deferred = $q.defer();
        $http({
            method: 'post',
            url: '/site/users/checkemail',
            data: { email: email }
        }).success(function (response) {
            deferred.resolve(response);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.currentmsgcount = function (data) {
        var deferred = $q.defer();
        $http({
            method: 'post',
            url: '/site/chat/msgcount',
            data: data
        }).success(function (response) {
            deferred.resolve(response.count);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.unreadmsg = function (data) {
        var deferred = $q.defer();
        $http({
            method: 'Post',
            url: '/site/chat/unreadmsg',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };



    service.BecomeTaskerRegister = function (value, callback) {
        value.files = [];
        if (value.taskerfile.length > 0) {
            for (var i = 0; i < value.taskerfile.length; i++) {
                delete value.taskerfile[i].$$hashKey;
                value.files.push(value.taskerfile[i]);
            }
        }
        $http({
            // Upload.upload({
            method: 'post',
            url: '/site/users/taskerRegister',
            arrayKey: '',
            data: value
            /*    data: {
                    "avatars": value.avatar,
                    "taskerfile": value.files,
                    "tdata": JSON.stringify(value)
                }*/
        }).success(function (response) {
            callback(null, response);
        }).error(function (err) {
            callback(err, null);
        });
    };

    service.facebook = function () {

        var deferred = $q.defer();
        $http({
            method: 'get',
            url: '/auth/facebook'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.getMyLastName = function () {
        var deferred = $q.defer();
        FB.api('/me', {
            fields: 'last_name'
        }, function (response) {
            if (!response || response.error) {
                deferred.reject('Error occured');
            } else {
                deferred.resolve(response);
            }
        });
        return deferred.promise;
    }


    service.google = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/auth/google'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.Logout = function logout(currentuser) {
        //console.log('================',currentuser)
        var deferred = $q.defer();
        $http({
            method: 'Post',
            url: '/site-logout',
            data: currentuser
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.checkEmail = function (email) {
        var deferred = $q.defer();
        $http({
            method: 'Post',
            url: '/site/users/checkEmail',
            data: {
                'email': email
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.checktaskeremail = function (email) {
        var deferred = $q.defer();
        $http({
            method: 'Post',
            url: '/site/users/checktaskeremail',
            data: {
                'email': email
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    service.SetCredentials = function (username, user_id, token, user_type, tasker_status) {
        var authdata = token;
        $rootScope.siteglobals = {
            currentUser: {
                username: username,
                user_id: user_id,
                authdata: authdata,
                user_type: user_type,
                tasker_status: tasker_status
            }
        };
        socket.emit('create room', { user: user_id });
        //$http.defaults.headers.common['Authorization'] = authdata;
        $cookieStore.put('siteglobals', $rootScope.siteglobals);
        $rootScope.$emit('eventName', { count: 0 });
    };

    service.GetCredentials = function () {
        return $rootScope.siteglobals;
    };

    service.isAuthenticated = function () {
        var cookieData = $cookieStore.get('siteglobals');
        var isAuthenticated = false;
        //if (Object.keys($rootScope.siteglobals).length != 0) {
        if (cookieData) {
            isAuthenticated = true;
        }
        return isAuthenticated;
    };
    service.isTaskerAuthenticated = function () {
        var isAuthenticated = false;
        if (Object.keys($rootScope.siteglobals).length != 0 && $rootScope.siteglobals.currentUser.tasker_status == 1) {
            isAuthenticated = true;
        }
        return isAuthenticated;
    };

    service.ClearCredentials = function () {
        $rootScope.siteglobals = {};
        $cookieStore.remove('siteglobals');
        //$http.defaults.headers.common.Authorization = 'Basic ';
        $rootScope.$emit('eventName', { count: 0 });
    };

    return service;
}
