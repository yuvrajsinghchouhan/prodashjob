angular.module('quickRabbit.users').controller('adminsforgtCtrl', adminsforgtCtrl);
adminsforgtCtrl.$inject = ['$scope', 'UsersService','toastr'];
function adminsforgtCtrl($scope, UsersService,toastr) {
    var afc = this;
	   afc.forgotpass = function forgotpass(isValid, formData) {
    if (isValid) {

  		UsersService.forgotpass(formData).then(function (response) {
        toastr.success('Mail has been sent to you');
  		}, function (err) {
          toastr.error('Invalid Mail id');
  		});
  	} else {toastr.error('Invalid Mail id');}
	}
}
