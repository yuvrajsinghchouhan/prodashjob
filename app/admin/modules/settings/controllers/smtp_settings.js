angular.module('quickRabbit.settings').controller('smtpSettingsCtrl',smtpSettingsCtrl);
smtpSettingsCtrl.$inject = [ 'SMTPSettingsServiceResolve','SettingsService', 'toastr'];

function smtpSettingsCtrl(SMTPSettingsServiceResolve,SettingsService, toastr){
    var smtpsc = this;

    // Get SMTP Settings
    smtpsc.smtpSettings = SMTPSettingsServiceResolve[0];

    // Save SMTP Settings
    smtpsc.saveSMTPSettings = function saveSMTPSettings(isValid,data){
        if(isValid) {
        SettingsService.saveSMTPSettings(data).then(function(response){
            toastr.success('SMTP Settings Saved Successfully');
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
