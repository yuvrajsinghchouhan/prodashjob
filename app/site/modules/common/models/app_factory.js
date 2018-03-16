var app = angular.module('quickRabbit.site');
app.factory('MainService', MainService);
function MainService($http, $q) {
    var mainService = {
        getCurrentUsers: getCurrentUsers,
        getCurrentTaskers: getCurrentTaskers,
        setCurrentUserValue: setCurrentUserValue,
        getCurrentUserValue: getCurrentUserValue,
        getsubcategory: getsubcategory,
        landingdata: landingdata,
        searchSuggestions: searchSuggestions,
        settings: settings,
        subscription: subscription,
        searchchildSuggestions: searchchildSuggestions,
        getSliderList: getSliderList,
        getLanguage: getLanguage,
        getBgimage: getBgimage,
        gettaskersignupimage: gettaskersignupimage,
        getsetting: getsetting,
        getDefaultLanguage: getDefaultLanguage,
        getSocialNetworks: getSocialNetworks,
        getDefaultCurrency: getDefaultCurrency,
        getCurrency: getCurrency,
        getseosetting: getseosetting,
        getwidgets: getwidgets,
        getNotificationsCount: getNotificationsCount,
        getMainData: getMainData,
        getfbapi: getfbapi,
        getmorecategory: getmorecategory,
        otpverifications:otpverifications,
        getTransalatePage:getTransalatePage
    };
    return mainService;


    function getfbapi(test) {
        return 1589589941346013;
    }

    function getMainData(username) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/main'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getCurrentUsers(username) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'site/users/currentUser',
            data: {
                'currentUserData': username
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getSliderList(limit, skip) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/slider/list/?limit=' + limit + '&skip=' + skip
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getCurrentTaskers(username) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'site/users/currentTasker',
            data: {
                'currentUserData': username
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getsubcategory(categoryid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'site/category/getsubcategory',
            data: { categoryid: categoryid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function setCurrentUserValue(value) {
        mainService.currentValue = value;
    }

    function getCurrentUserValue() {
        return mainService.currentValue;
    }

    function landingdata() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/landing/landingdata'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function searchSuggestions(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/landing/search-suggestions',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function searchchildSuggestions(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/landing/search-childSuggestions',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function subscription(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/landing/subscription',
            data: { email: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }



    function settings() {
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
    }

    function getLanguage() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getLanguage'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getBgimage() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getBgimage'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function gettaskersignupimage() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/gettaskersignupimage'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getsetting() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getsetting'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getDefaultLanguage(data) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getDefaultLanguage?name=' + data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getDefaultCurrency(data) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getDefaultCurrency?name=' + data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getCurrency() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getCurrency'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getseosetting() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getseosetting'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getwidgets() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getwidgets'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getSocialNetworks() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getSocialNetworks'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getNotificationsCount(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/notifications/count',
            data: data
        }).success(function (data) {
            deferred.resolve(data.count);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getmorecategory(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/landing/getmorecategory',
            data: { data: data }
        }).success(function (data) {
           // console.log("data", data)
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }



    function otpverifications(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/otpverifications',
            data: { data: data }
        }).success(function (data) {
           // console.log("data", data)
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

     function getTransalatePage(pageId,languagename) {
        var deferred = $q.defer();
        var data={};
        data.page = pageId;
        data.language = languagename;
        $http({
            method: 'POST',
            url: '/site/landing/getTransalatePage',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    

}
