angular.module('quickRabbit.users').controller('adminsmailforgtCtrl', adminsmailforgtCtrl);
adminsmailforgtCtrl.$inject = ['$scope','toastr','$stateParams','UsersService'];
function adminsmailforgtCtrl($scope,toastr,$stateParams,UsersService) {
  // $scope.pathUrl =  window.location.pathname;

   var userid = $stateParams.userid;

    var afmc = this;
	   afmc.forgotpassmail = function forgotpassmail(isValid, formData) {
    if (isValid) {

  		UsersService.forgotpasssave({ formData:formData,userid: userid}).then(function (response) {
        toastr.success('Password Changed Successfully!');
  		}, function (err) {
          toastr.error('Error in saving your password');
  		});
  	} else {toastr.error('Error in saving your password');}
	}
}
