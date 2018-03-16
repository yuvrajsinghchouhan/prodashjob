angular.module('quickRabbit.settings').controller('seoSettingsCtrl', seoSettingsCtrl);
seoSettingsCtrl.$inject = ['SeoSettingsServiceResolve', 'SettingsService', 'toastr'];

function seoSettingsCtrl(SeoSettingsServiceResolve, SettingsService, toastr) {
    var ssc = this;

    ssc.seoSettings = SeoSettingsServiceResolve[0];
    ssc.saveSeoSettings = function saveSeoSettings(isValid, data) {
        if (isValid) {
            SettingsService.saveSeoSettings(data).then(function (response) {
                toastr.success('SEO Settings Saved Successfully');
            }, function (err) {
                for (var i = 0; i < err.length; i++) {
                    toastr.error('Your credentials are gone' + err[i].msg + '--' + err[i].param);
                }
            });
        } else {
            toastr.error('form is invalid');
        }
    };
}
