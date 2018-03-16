angular.module('quickRabbit.settings').controller('mobileContentCtrl', mobileContentCtrl);
mobileContentCtrl.$inject = ['mobileSettingsServiceResolve', 'SettingsService', 'toastr'];
function mobileContentCtrl(mobileSettingsServiceResolve, SettingsService, toastr) {
    var mcc = this;
    mcc.mobilecontent = mobileSettingsServiceResolve[0];
    mcc.mobileSave = function mobileSave(isValid, data) {
        if (isValid) {
            SettingsService.mobileSave(data).then(function (response) {
                toastr.success('Saved Successfully');
            }, function (err) {
            });
        } else {
            SettingsService.mobileSave(data).then(function (response) {
                toastr.success('Saved Successfully');
            }, function (err) {
            });
        }
    };
}
