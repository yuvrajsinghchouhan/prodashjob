angular.module('quickRabbit.settings').controller('smsSettingsCtrl',smsSettingsCtrl);
smsSettingsCtrl.$inject = [ 'SMSSettingsServiceResolve','SettingsService', 'toastr'];

function smsSettingsCtrl(SMSSettingsServiceResolve,SettingsService, toastr){
    var smsc = this;
    // Get SMTP Settings
    smsc.smsSettings = SMSSettingsServiceResolve[0];
    smsc.savesmsSettings = function savesmsSettings(isValid,data){
        if(isValid) {
        SettingsService.savesmsSettings(data).then(function(response){
            toastr.success('SMS Settings Saved Successfully');
        },function(err){
            /*toastr.error('Sorry, Something went wrong', 'Error');*/
            for(var i=0;i<err.length;i++){
                    toastr.error('Your credentials are gone'+err[i].msg+'--'+err[i].param);
                }
        });
        }else{
            toastr.error('form is invalid');
        }
    };
}
