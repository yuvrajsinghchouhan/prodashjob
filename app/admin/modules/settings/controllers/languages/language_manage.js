angular.module('quickRabbit.languages').controller('languageSettingsManageCtrl', languageSettingsManageCtrl);
languageSettingsManageCtrl.$inject = ['languageServiceManageResolve', 'toastr', 'languageService', '$state', '$stateParams'];

function languageSettingsManageCtrl(languageServiceManageResolve, toastr, languageService, $state, $stateParams) {
	var lsmc = this;
	lsmc.translationKey = languageServiceManageResolve.data;
	lsmc.translationValue = languageServiceManageResolve.data;

	lsmc.currentPage = 1;
	lsmc.entryLimit = 10;
	lsmc.pageSizes = [5, 10, 50, 100];
	lsmc.maxPaginationSize = 3;

	lsmc.data = {}
	lsmc.data.count = languageServiceManageResolve.total;


	lsmc.pageChange = function pageChange(current, limit) {
		languageService.managelanguage($stateParams.langId, current, limit).then(function (response) {
			lsmc.translationKey = response.data;
			lsmc.translationValue = response.data;
		}, function (err) {
			toastr.error('Unable to save your data');
		});
	}

	lsmc.submitlanguageData = function submitlanguageData() {
		languageService.submitlanguageDataCall($stateParams.langId, lsmc.translationValue).then(function (response) {
			toastr.success('Language Submitted Successfully');
			$state.go('app.settings.languageSettings.list', {}, { reload: true });
		}, function (err) {
			toastr.error('Unable to save your data');
		});
	}

}
