angular.module('quickRabbit.cancellation').controller('editCancellationCtrl', editCancellationCtrl);

editCancellationCtrl.$inject = [ 'editcancellationResolve','cancellationService', '$scope','toastr', '$state','$stateParams'];

function editCancellationCtrl(editcancellationResolve, cancellationService, $scope,toastr,$state,$stateParams) {

    var ecal = this;
    ecal.editData=editcancellationResolve[0];
    if ($stateParams.id) {
        ecal.action = 'Edit';
        ecal.breadcrumb = 'SubMenu.CANCELLATION';
    } else {
        ecal.action = 'Add';
        ecal.breadcrumb = 'SubMenu.CANCELLATION';
    }
    ecal.submit = function submit(isValid) {
    if(isValid) {
        cancellationService.save(ecal.editData).then(function (response) {
            if (response.code == 11000) {
                toastr.error('Coupon Code Not Added Successfully');
            } else   if(response.data == "wrong"){
                toastr.error('Your Credentials are gone please login again.....');
            }
            else {
                if(ecal.action == 'edit') {
                    var action = "edited";
                } else {
                    var action = "added";
                }
               toastr.success('Cancellation reason ' + action + ' Successfully');
                $state.go('app.cancellation.list');
            }
        }, function (err) {
            /*toastr.error('Your credentials are gone', 'Error');*/
            for(var i=0;i<err.length;i++){
                toastr.error('Your credentials are gone'+err[i].msg+'--'+err[i].param);
            }
        });
    }else{
        toastr.error('form is invalid');
    }

  };

}
