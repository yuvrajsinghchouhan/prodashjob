angular.module('quickRabbit.settings').controller('generalSettingsCtrl', generalSettingsCtrl);

generalSettingsCtrl.$inject = ['GeneralSettingsServiceResolve', 'TimeZoneSettingsServiceResolve', 'toastr', 'SettingsService'];
function generalSettingsCtrl(GeneralSettingsServiceResolve, TimeZoneSettingsServiceResolve, toastr, SettingsService) {
	var gsc = this;
	gsc.generalSettings = GeneralSettingsServiceResolve[0];
	gsc.generalSettings.timenow = new Date().getTime();
	gsc.timezone = TimeZoneSettingsServiceResolve;


	gsc.time_format = ['hh:mm a', 'HH:mm'];
	gsc.date_format = ['MMMM Do, YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];

	if (gsc.time_format.indexOf(gsc.generalSettings.time_format) < 0) {
		gsc.customtime = gsc.generalSettings.time_format;
	}

	if (gsc.date_format.indexOf(gsc.generalSettings.date_format) < 0) {
		gsc.customdate = gsc.generalSettings.date_format;
	}

	gsc.clockFunc = function clockFunc() {
		gsc.generalSettings.timezone = gsc.generalSettings.time_zone;
		gsc.generalSettings.format = gsc.generalSettings.date_format;
	}

	gsc.datekeyFunc = function datekeyFunc() {
		gsc.generalSettings.datekeyformat = gsc.generalSettings.date_format;
	}

	gsc.submitGeneralSettings = function submitGeneralSettings(isValid, data) {
		if (isValid) {
			 console.log("settings",data);
			SettingsService.editGeneralSettings(gsc.generalSettings).then(function (response) {
				if (response.code == 11000) {
					toastr.error('Setting Not Added Successfully');
				} else {
					toastr.success('General Settings Saved Successfully');
				}
			}, function (err) {
				toastr.error('Your credentials are gone' + err.data[0].msg + '--' + err.data[0].param);
			});
		} else {
			toastr.error('form is invalid');
		}
	};


//wallet setting

	gsc.walletStatus = GeneralSettingsServiceResolve[0].wallet.status;
	if (gsc.walletStatus == 1) {
		gsc.walletStatus = true;
	} else {
		gsc.walletStatus = false;
	}
	gsc.walletStatusChange = function (value) {

		gsc.data = {};
		if (value == false) {
			gsc.data.status = 0;
		} else {
			gsc.data.status = 1;
		}

		SettingsService.walletStatusChange(gsc.data).then(function (response) {
			toastr.success('Wallet Setting Updated successfully');
		}, function (err) {
			if (err.msg) {
				$scope.addAlert('danger', err.msg);
			} else {
				toastr.error('Unable to save Wallet Settting');
			}
		});
		SettingsService.getGeneralSettings().then(function (response) {
			gsc.generalSettings = response[0];
		});

	};
	//cash Setting
	gsc.cashStatus = GeneralSettingsServiceResolve[0].pay_by_cash.status;
	if (gsc.cashStatus == 1) {
		gsc.cashStatus = true;
	}
	else {
		gsc.cashStatus = false;
	}
	gsc.cashStatusChange = function (value) {
		gsc.data = {};
		if (value == false) {
			gsc.data.status = 0;
		} else {
			gsc.data.status = 1;
		}

		SettingsService.cashStatusChange(gsc.data).then(function (response) {
			toastr.success('Cash Setting Updated Successfully');
		}, function (err) {
			if (err.msg) {
				$scope.addAlert('danger', err.msg);
			} else {
				toastr.error('Unable to save Cash Setting');
			}
		})
		SettingsService.getGeneralSettings().then(function (response) {
			gsc.generalSettings = response[0];
		});

	};

	//Referral Setting
	gsc.referralStatus = GeneralSettingsServiceResolve[0].referral.status;

	if (gsc.referralStatus == 1) {
		gsc.referralStatus = true;
	}
	else {
		gsc.referralStatus = false;
	}
	gsc.referralStatusChange = function (value) {
		gsc.data = {};
		if (value == false) {
			gsc.data.status = 0;
		} else {
			gsc.data.status = 1;
		}

		SettingsService.referralStatusChange(gsc.data).then(function (response) {
			toastr.success('Referral Setting Updated Successfully');
		}, function (err) {
			if (err.msg) {
				$scope.addAlert('danger', err.msg);
			} else {
				toastr.error('Unable to save Referral Settting');
			}
		});
		SettingsService.getGeneralSettings().then(function (response) {
			gsc.generalSettings = response[0];
		})
	};


	if(GeneralSettingsServiceResolve[0].categorycommission){
			if(GeneralSettingsServiceResolve[0].categorycommission.status == 1) {
			gsc.categorycomStatus = 1;
			gsc.categorycomStatus = true;
			}
			else{
			gsc.categorycomStatus = 0;
			gsc.categorycomStatus = false;
			}
		}
		else{
		gsc.categorycomStatus = 0;
		gsc.categorycomStatus = false;
		}

		gsc.categoryStatusChange = function (value) {
		// console.log("value",value)
			gsc.data = {};
			if (value == false) {
				gsc.data.status = 0;
			} else {
				gsc.data.status = 1;
			}

			SettingsService.categoryStatusChange(gsc.data).then(function (response) {
				toastr.success('Admin Commission Base Changed');
			}, function (err) {
				if (err.msg) {
					$scope.addAlert('danger', err.msg);
				} else {
					toastr.error('Unable to change Admin Commission Base');
				}
			});
			SettingsService.getGeneralSettings().then(function (response) {
				gsc.generalSettings = response[0];
			})
		};

}
