angular.module('quickRabbit.contactus')
	.controller('contactCtrl', contactCtrl);

contactCtrl.$inject = ['$scope', 'ContactService', '$rootScope', '$location', '$filter', '$state', 'toastr', '$translate'];

function contactCtrl($scope, ContactService, $rootScope, $location, $filter, $state, toastr, $translate) {

	var cttc = this;
	cttc.Messagedetails = {};
	
	cttc.userMessage = function userMessage(isValid, formData) {
		if (isValid && cttc.Messagedetails.mobile != undefined) {
			console.log("cttc.Messagedetails.mobile",cttc.Messagedetails.mobile);
				cttc.Messagedetails.mobile = cttc.Messagedetails.mobile.code + "-" + cttc.Messagedetails.mobile.number;
				ContactService.savemessage(cttc.Messagedetails).then(function (response) {
					//$scope.addAlert('success', 'Message Sent Successfully');
					$translate('WELL GET IN TOUCH WITH YOU SHORTLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
					//toastr.success('Message Sent Successfully');
					$state.go('landing');
				}, function (err) {
					if (err.msg) {
						//$scope.addAlert('danger', err.msg);
						toastr.error('danger', err.msg)
					} else {
						//$scope.addAlert('danger', 'Sending Message Failed');
						$translate('WELL GET IN TOUCH WITH YOU SHORTLY').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
						//	toastr.success('SENDING MESSAGE FAILED');
					}
				});
		} else {
			$translate('PLEASE ENTER THE VALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
			//	$scope.addAlert('danger', 'Please enter the valid data');
		}
	};
	cttc.subscription = function subscription(data) {
	};
};
