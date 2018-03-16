var app = angular.module('shopshy.users');

app.factory('UsersService', UsersService);

function UsersService($http, $q) {

    var UsersService = {};

    UsersService.callGet = function () {

        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/users/getusers'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };
    UsersService.GetUserDetails = function (Query) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/users/getusers?filter=' + JSON.stringify(Query)
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    UsersService.getCurrentUserData = function (email) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/currentuser',
            data: {
                'currentUserData': email
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    UsersService.deleteUser = function (value) {

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/users/deleteuser',
            data: {
                'deluser': value
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;

    };

    UsersService.addUser = function (value) {
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

    };

    UsersService.editUser = function (value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/editUser',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;

    };

    UsersService.updateUserProfileService = function (value) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/updateprofile',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };
    UsersService.LoginUsers = function (email, pwd) {
        var deferred = $q.defer();
        $http({
            method: 'Post',
            url: '/users/LoginUser',
            data: {
                'email': email,
                'pwd': pwd
            }
        }).success(function (data) {
            var loginUser = '';
            if (typeof $cookies.get("shopsy_session_user_id") != 'undefined') {
                loginUser = JSON.parse($cookies.get("shopsy_session_user_id"));
            }
            deferred.resolve([data, loginUser]);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };



    UsersService.check_shop_like = function (user_id, sid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            data: {
                user_id: user_id,
                sid: sid
            },
            url: '/site/users/check_shop_like'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };
    UsersService.check_product_like = function (user_id, pid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            data: {
                user_id: user_id,
                pid: pid
            },
            url: '/site/users/check_product_like'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
    UsersService.check_follow_user = function (user_id, follow_id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            data: {
                user_id: user_id,
                follow_id: follow_id
            },
            url: '/site/users/check_follow_user'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }


    UsersService.likeorunlikeshop = function (user_id, sid, type, fevId) {
        var data = {};
        if (fevId != '') {
            data = { user_id: user_id, sid: sid, type: type, fevId: fevId };
        } else {
            data = { user_id: user_id, sid: sid, type: type };
        }

        var deferred = $q.defer();
        $http({
            method: 'POST',
            data: data,
            url: '/site/users/likeorunlikeshop'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    UsersService.likeorunlikeproduct = function (user_id, pid, type, fevId) {
        var data = {};
        if (fevId != '') {
            data = { user_id: user_id, pid: pid, type: type, fevId: fevId };
        } else {
            data = { user_id: user_id, pid: pid, type: type };
        }

        var deferred = $q.defer();
        $http({
            method: 'POST',
            data: data,
            url: '/site/users/likeorunlikeproduct'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }


    UsersService.add_delete_follow = function (user_id, follow_id, type, followTableId) {
        var data = {};
        if (followTableId != '') {
            data = { user_id: user_id, follow_id: follow_id, type: type, followTableId: followTableId };
        } else {
            data = { user_id: user_id, follow_id: follow_id, type: type };
        }

        var deferred = $q.defer();
        $http({
            method: 'POST',
            data: data,
            url: '/site/users/add_delete_follow'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    UsersService.getlikedproduct = function (user_id, product_ids) {
        var url = '/site/users/getlikedproduct';
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: url,
            data: {
                user_id: user_id,
                product_ids: product_ids
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    UsersService.getfollowingUsers = function (user_id, follow_ids) {
        var url = '/site/users/getfollowingUsers';
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: url,
            data: {
                user_id: user_id,
                follow_ids: follow_ids
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    UsersService.getfollowingdetails = function (filter, page, itemsPerPage) {
        var url = '/site/users/getfollowingdetails';
        var option = { sort: '', user_id: '', LoginId: '' };
        if (angular.isDefined(filter.user_id)) {
            option.user_id = filter.user_id;
        }
        if (angular.isDefined(filter.sort)) {
            option.sort = 'createdAt';
            option.status = 'true';
            if (filter.sort == 'AL') {
                option.sort = 'name';
            }
        }
        if (angular.isDefined(filter.LoginId)) {
            option.LoginId = filter.LoginId;
        }
        var url = '';
        if (page > 1) {
            var skip = (parseInt(page) - 1) * itemsPerPage;
            url = '/site/users/getfollowingdetails?page=' + page + '&skip=' + skip + '&itemsCount=' + itemsPerPage + '&sort=' + option.sort + '&user_id=' + option.user_id + '&status=' + option.status + '&login_id=' + option.LoginId;
        } else {
            url = '/site/users/getfollowingdetails?page=' + 0 + '&skip=' + 0 + '&itemsCount=' + itemsPerPage + '&sort=' + option.sort + '&user_id=' + option.user_id + '&status=' + option.status + '&login_id=' + option.LoginId;
        }
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: url
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    UsersService.getShopFavDetails = function (filter, page, itemsPerPage) {
        var url = '/site/users/getshopfavdetails';
        var option = { sort: '', shop_id: '', LoginId: '' };
        if (angular.isDefined(filter.shop_id)) {
            option.shop_id = filter.shop_id;
        }
        if (angular.isDefined(filter.sort)) {
            option.sort = 'createdAt';
            option.status = 'true';
            if (filter.sort == 'AL') {
                option.sort = 'name';
            }
        }
        if (angular.isDefined(filter.LoginId)) {
            option.LoginId = filter.LoginId;
        }
        var url = '';
        if (page > 1) {
            var skip = (parseInt(page) - 1) * itemsPerPage;
            url = '/site/users/getshopfavdetails?page=' + page + '&skip=' + skip + '&itemsCount=' + itemsPerPage + '&sort=' + option.sort + '&shop_id=' + option.shop_id + '&status=' + option.status + '&login_id=' + option.LoginId;
        } else {
            url = '/site/users/getshopfavdetails?page=' + 0 + '&skip=' + 0 + '&itemsCount=' + itemsPerPage + '&sort=' + option.sort + '&shop_id=' + option.shop_id + '&status=' + option.status + '&login_id=' + option.LoginId;
        }
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: url
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    UsersService.getfollowerdetails = function (filter, page, itemsPerPage) {
        var url = '/site/users/getfollowerdetails';
        var option = { sort: '', user_id: '', LoginId: '' };
        if (angular.isDefined(filter.user_id)) {
            option.user_id = filter.user_id;
        }
        if (angular.isDefined(filter.LoginId)) {
            option.LoginId = filter.LoginId;
        }
        if (angular.isDefined(filter.sort)) {
            option.sort = 'createdAt';
            option.status = 'true';
            if (filter.sort == 'AL') {
                option.sort = 'name';
            }
        }
        var url = '';
        if (page > 1) {
            var skip = (parseInt(page) - 1) * itemsPerPage;
            url = '/site/users/getfollowerdetails?page=' + page + '&skip=' + skip + '&itemsCount=' + itemsPerPage + '&sort=' + option.sort + '&user_id=' + option.user_id + '&status=' + option.status + '&login_id=' + option.LoginId;
        } else {
            url = '/site/users/getfollowerdetails?page=' + 0 + '&skip=' + 0 + '&itemsCount=' + itemsPerPage + '&sort=' + option.sort + '&user_id=' + option.user_id + '&status=' + option.status + '&login_id=' + option.LoginId;
        }
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: url
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    UsersService.getshoplikeUsers = function (user_id, shop_ids) {
        var url = '/site/users/getshoplikeUsers';
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: url,
            data: {
                user_id: user_id,
                shop_ids: shop_ids
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };




    return UsersService;
}
