angular.module('quickRabbit.forgotpassword').controller('pwdloginCtrl',pwdloginCtrl);
pwdloginCtrl.$inject = ['$scope', 'ForgotpasswordService','ForgotpasswordServiceResolve','toastr','$translate'];
function pwdloginCtrl($scope, ForgotpasswordService,ForgotpasswordServiceResolve,toastr,$translate) {
  var pwc = this;
	pwc.forgotpass = function forgotpass(isValid,formData) {
	if (isValid) {
		ForgotpasswordService.saveUserInfo(formData).then(function (response) {
      $translate('PASSWORD RESET MAIL HAS BEEN SENT TO YOUR EMAIL ID').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
    //  toastr.success('Mail has been sent to you');
		}, function (err) {
        //toastr.error('Invalid Mail id');
        $translate('INVALID EMAIL ID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

		});
	} else {
    //toastr.error('Email is required');
  $translate('EMAIL IS REQUIRED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
}
	}
}
