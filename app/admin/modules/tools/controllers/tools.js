angular.module('quickRabbit.tools').controller('toolsCtrl', toolsCtrl);

toolsCtrl.$inject = ['toastr', 'ToolsService', '$stateParams'];
function toolsCtrl(toastr, ToolsService, $stateParams) {
	var gsc = this;
	ToolsService.getSettings().then(function (response) {
		gsc.getsetting = response;
	});
	gsc.exportData = function exportData(data) {
		if (data == 'Tasks') {
			ToolsService.exportData().then(function (response) {
				if (response.error) {
					toastr.error('No data found to export');
				} else {
					window.location.href = gsc.getsetting.site_url + "tools/taskexport";
				}
			}, function (err) {
				toastr.error(err);
			});
		} else if (data == 'User') {
			ToolsService.exportuserData(data).then(function (response) {
				if (response.error) {
					toastr.error('No data found to export');
				} else {
					window.location.href = gsc.getsetting.site_url + "tools/exportuser";
				}
			}, function (err) {
				toastr.error(err);
			});
		}
		else if (data == 'Taskers') {
			ToolsService.exporttaskerData(data).then(function (response) {
				if (response.error) {
					toastr.error('No data found to export');
				} else {
					window.location.href = gsc.getsetting.site_url + "tools/exporttasker";
				}
			}, function (err) {
				toastr.error(err);
			});
		} else {
			ToolsService.exportTransactionData(data).then(function (response) {
				if (response.error) {
					toastr.error('No data found to export');
				} else {
					window.location.href = gsc.getsetting.site_url + "tools/exportTransactionData";
				}
			}, function (err) {
				toastr.error(err);
			});
		}

	};

}
