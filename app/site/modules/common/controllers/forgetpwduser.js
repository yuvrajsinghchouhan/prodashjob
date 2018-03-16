angular.module('quickRabbit.forgotpassword').controller('pwduserCtrl', pwduserCtrl);
pwduserCtrl.$inject = ['$scope', 'ForgotpwduserService', 'ForgotpwduserServiceResolve','toastr','$translate'];
function pwduserCtrl($scope, ForgotpwduserService, ForgotpwduserServiceResolve,toastr, $translate) {
    var pwuc = this;
	   pwuc.forgotpass = function forgotpass(isValid, formData) {
    if (isValid) {
  		ForgotpwduserService.saveUserInfopwd(formData).then(function (response) {
        //toastr.success('Mail has been sent to you');
        $translate('PASSWORD RESET MAIL HAS BEEN SENT TO YOUR EMAIL ID').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
  		}, function (err) {
          //toastr.error('Invalid Email id');
          $translate('INVALID EMAIL ID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

  		});
  	} else {
      $translate('EMAIL IS REQUIRED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      //toastr.error('Email is required');
    }
	}
}
