angular.module('quickRabbit.settings').controller('SocialNetworksSettingsCtrl',SocialNetworksSettingsCtrl);
SocialNetworksSettingsCtrl.$inject = [ 'SocialNetworksSettingsServiceResolve','SettingsService', 'toastr'];
function SocialNetworksSettingsCtrl(SocialNetworksSettingsServiceResolve,SettingsService, toastr){
	var snsc = this;

	// Get Social Networks Settings
	snsc.SocialNetworksSettings = SocialNetworksSettingsServiceResolve[0];

	// Save Social Networks Settings
    snsc.saveSocialNetworksSettings = function saveSocialNetworksSettings(data){
        SettingsService.saveSocialNetworksSettings(data).then(function(response){
            toastr.success('Social Networks Settings Saved Successfully');
        },function(err){
            toastr.error('Sorry, Something went wrong');
        });
    };

}
