angular.module('quickRabbit.forgotpassword').controller('pwdmailCtrl', pwdmailCtrl);
pwdmailCtrl.$inject = ['$scope', 'toastr', 'ForgotpwdusermailService', '$state','$stateParams','$translate'];
function pwdmailCtrl($scope, toastr, ForgotpwdusermailService, $state, $stateParams, $translate) {
  var userid = $stateParams.userid;
  var resetid = $stateParams.resetid;
  var pwmc = this;
  pwmc.forgotpassmailuser = function forgotpassmailuser(isValid, formData) {
    if (isValid) {
      ForgotpwdusermailService.saveUsermailpwd({ formData: formData, userid: userid, resetid: resetid }).then(function (response) {
        //toastr.success('Password has been changed successfully!');
        $translate('PASSWORD HAS BEEN CHANGED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

		$state.go('userlogin');
      }, function (err) {
        $translate('ERROR IN CHANGING PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        //toastr.error('Error in changing password');
      });
    } else {
      $translate('ERROR IN CHANGING PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      //toastr.error('Error in changing password');
    }
  }
}
