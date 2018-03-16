var app = angular.module('quickRabbit.settings');
app.factory('SettingsService', SettingsService);
SettingsService.$inject = ['$http', '$q', 'Upload'];

function SettingsService($http, $q, Upload) {
    var SettingsService = {

        getGeneralSettings: getGeneralSettings,
        getTimeZoneSettings: getTimeZoneSettings,
        editGeneralSettings: editGeneralSettings,
        getSeoSettings: getSeoSettings,
        saveSeoSettings: saveSeoSettings,
        getWidgets: getWidgets,
        saveWidgets: saveWidgets,
        getSMTPSettings: getSMTPSettings,
        saveSMTPSettings: saveSMTPSettings,
        getSMSSettings: getSMSSettings,
        savesmsSettings: savesmsSettings,
        getSocialNetworksSettings: getSocialNetworksSettings,
        saveSocialNetworksSettings: saveSocialNetworksSettings,
        walletStatusChange: walletStatusChange,
        categoryStatusChange: categoryStatusChange,
        cashStatusChange: cashStatusChange,
        referralStatusChange: referralStatusChange,
        mobileSave: mobileSave,
        getmobileSettings:getmobileSettings

    };
    return SettingsService;

    /** General Settings */
    // Get General Settings
    function getGeneralSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/general'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    function mobileSave(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/mobilecontent/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    function getmobileSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/mobile/content'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    function getTimeZoneSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/general/timezones'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    // post General Settings
    function editGeneralSettings(value) {
        var deferred = $q.defer();
        Upload.upload({
            url: '/settings/general/save',
            arrayKey: '',
            data: value
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    /** /General Settings */

    /** SEO Settings */
    // Get SEO Settings
    function getSeoSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/seo'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    // Save SEO Settings
    function saveSeoSettings(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/seo/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /** /SEO Settings */

    /** Widgets */
    // Get Widgets
    function getWidgets() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/widgets'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    // Save Widgets
    function saveWidgets(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/widgets/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /** /Widgets */

    /** SMTP Settings */
    // Get SMTP Settings
    function getSMTPSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/smtp'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    // Save SMTP Settings
    function saveSMTPSettings(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/smtp/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /** /SMTP Settings */

    //Get Sms Settings

    function getSMSSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/sms'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    //Get Sms Settings
    //Save SMS Settings

    function savesmsSettings(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/sms/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    //Save SMS Settings

    /** Social Networks Settings */
    // Get Social Networks Settings
    function getSocialNetworksSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/social-networks'
        }).success(function (data) {
            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    // Save Social Networks Settings
    function saveSocialNetworksSettings(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/social-networks/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /** /Social Networks Settings */

    function walletStatusChange(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/walletSetting',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
	
	function categoryStatusChange(data) {
	    var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/categorySetting',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function cashStatusChange(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/cashSetting',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function referralStatusChange(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/referralStatus',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

}
