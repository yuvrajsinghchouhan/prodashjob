angular.module('quickRabbit.administrator').controller('adminAddCtrl', adminAddCtrl);
adminAddCtrl.$inject = ['adminsEditServiceResolve', '$scope', 'toastr', 'AdminsService', '$state', '$stateParams'];
function adminAddCtrl(adminsEditServiceResolve, $scope, toastr, AdminsService, $state, $stateParams) {
    var adac = this;
    adac.editAdminData = adminsEditServiceResolve[0];
    $scope.location = {};
    if ($stateParams.id) {
        adac.action = 'edit';
        adac.breadcrumb = 'SubMenu.ADMIN_LIST';
        adac.msg ="Edited";
    } else {
        adac.action = 'add';
        adac.breadcrumb = 'SubMenu.ADMIN_LIST';
        adac.msg ="Added";
    }
    adac.submitUserEditData = function submitUserEditData(isValid, data) {
        data.loacation = $scope.location;
        if (isValid) {
            AdminsService.editUserCall(adac.editAdminData).then(function (response) {
            toastr.success('Admin '+adac.msg +' Successfully');
                $state.go('app.admins.list');
            }, function (err) {
              if(err){
                toastr.error(err.data.message);
              }
            });
        } else {
            toastr.error('form is invalid');
        }
    }

}
