angular.module('quickRabbit.forgotpassword')
  .controller('pwdmailtskrCtrl', pwdmailtskrCtrl);
pwdmailtskrCtrl.$inject = ['$scope', 'toastr', 'ForgotpwdtaskermailService', '$state', '$stateParams','$translate'];
function pwdmailtskrCtrl($scope, toastr, ForgotpwdtaskermailService, $state , $stateParams, $translate) {
  var userid = $stateParams.userid;
  var resetid = $stateParams.resetid;
  var pwmtc = this;
  pwmtc.forgotpassmailtasker = function forgotpassmailtasker(isValid, formData) {
    if (isValid) {
      ForgotpwdtaskermailService.saveTaskermailpwd({ formData: formData, userid: userid, resetid: resetid }).then(function (response) {
        //toastr.success('Password has been changed successfully!');
        $translate('PASSWORD HAS BEEN CHANGED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

		$state.go('taskerlogin');
      }, function (err) {
        $translate('ERROR IN CHANGING PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        //toastr.error('Error in changing password');
      });
    } else { //toastr.error('Error in changing password');
    $translate('ERROR IN CHANGING PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
  }
  }
}
