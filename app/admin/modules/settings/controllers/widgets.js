angular.module('quickRabbit.settings').controller('widgetsCtrl', widgetsCtrl);
widgetsCtrl.$inject = ['WidgetsServiceResolve', 'SettingsService', 'toastr'];
function widgetsCtrl(WidgetsServiceResolve, SettingsService, toastr) {
	var wsc = this;

	// Get Widgets Settings
	wsc.Widgets = WidgetsServiceResolve[0];

	// Save Widgets Settings
    wsc.saveWidgets = function saveWidgets(data) {
        SettingsService.saveWidgets(data).then(function (response) {
			toastr.success('Widget settings saved Successfully');
        }, function (err) {
            toastr.error('Sorry, Something went wrong');
        });
    };

	SettingsService.getGeneralSettings().then(function (response) {
		wsc.site_title = response[0].site_title;
	});

}
