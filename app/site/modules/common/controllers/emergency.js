angular.module('quickRabbit.forgotpassword').controller('emergencyCtrl', emergencyCtrl);
emergencyCtrl.$inject = ['$scope', 'toastr', 'ForgotpasswordService', '$stateParams','$translate','$state'];
function emergencyCtrl($scope, toastr, ForgotpasswordService, $stateParams, $translate,$state) {
  var userid = $stateParams.userid;
  var emrg = this;

  emrg.verifyemergencycontact = function verifyemergencycontact(isValid, formData) {
    if (isValid) {
      ForgotpasswordService.verifyemergencycontact({ formData: formData, userid: userid }).then(function (response) {
        //toastr.success('Mobile no verified successfully!');
        $translate('MOBILE NO VERIFIED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
         $state.go('landing');
       
      }, function (err) {
        $translate('ERROR IN MOBILE VERIFICATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      //  toastr.error('Error in mobile verification');
      });
    } else { //toastr.error('Error in mobile verification');
    $translate('ERROR IN MOBILE VERIFICATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
  }
  }
  ForgotpasswordService.mailverification({userid: userid }).then(function (response) {
    //toastr.success('Mail verified  successfully!');
    $translate('MAIL VERIFIED  SUCCESSFULLY!').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

  }, function (err) {
    $translate('ERROR IN MAIL VERIFICATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    //toastr.error('Error in mail verification');
  }); 
}
