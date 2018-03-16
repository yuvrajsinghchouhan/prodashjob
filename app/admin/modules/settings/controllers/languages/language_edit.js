(function () {
	'use strict';
	angular.module('quickRabbit.languages', []).controller('languageSettingsEditCtrl', languageSettingsEditCtrl);

	languageSettingsEditCtrl.$inject = ['languageServiceResolve', 'toastr', 'languageService', '$state', '$stateParams'];

	function languageSettingsEditCtrl(languageServiceResolve, toastr, languageService, $state, $stateParams) {
		var lsec = this;
		lsec.languageData = {};
		lsec.languageData = languageServiceResolve[0][0];

		if ($stateParams.id) {
			lsec.action = 'edit';
			lsec.breadcrumb = 'SubMenu.LANGUAGE_EDITSETTINGS';
			lsec.msg = 'Edited';
		} else {
			lsec.action = 'add';
			lsec.breadcrumb = 'SubMenu.LANGUAGE_ADDSETTINGS';
			lsec.msg = 'Added';
		}
		lsec.submitlanguage = function submitlanguage(data, isValid) {

			if (isValid) {
				if (data.status == 2) {
					if (lsec.languageData.default == 1) {
						toastr.error('Please chnage your Default language to some other language then only You can able to Unselect this language.....');
					} else {
						languageService.editlanguage(data).then(function (response) {
							if (response.data == "wrong") {
								toastr.error('Your Credentials are gone please login again.....');
							} else
								if (response.nModified == 0) {
									$state.go('app.settings.languageSettings.list', {}, { reload: true });
									toastr.error('Sorry, Unable to update your datas');
								} else {
									$state.go('app.settings.languageSettings.list', {}, { reload: true });
									toastr.success('Template ' + lsec.msg + ' successfully');
								}


						}, function (err) {
							for (var i = 0; i < err.length; i++) {
								toastr.error('Your credentials are gone' + err[i].msg + '--' + err[i].param);
							}
						});
					}
				} else {
					languageService.editlanguage(data).then(function (response) {
						if (response.data == "wrong") {
							toastr.error('Your Credentials are gone please login again.....');
						} else
							if (response.nModified == 0) {
								$state.go('app.settings.languageSettings.list', {}, { reload: true });
								toastr.error('Sorry, Unable to update your datas');
							} else {
								$state.go('app.settings.languageSettings.list', {}, { reload: true });
								toastr.success('Template ' + lsec.msg + ' successfully');
							}


					}, function (err) {
						// for(var i=0;i<err.length;i++){
						// 			toastr.error('Your credentials are gone'+err[i].msg+'--'+err[i].param);
						// 		}
						toastr.error(err.message);
					});
				}
			}
			else {
				toastr.error("Form is invalid");
			}
		};

	}

})();
