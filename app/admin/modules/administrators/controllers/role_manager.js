angular.module('quickRabbit.administrator').controller('subAdminCtrl', subAdminCtrl);

subAdminCtrl.$inject = ['roleManagerResolve', 'RoleManagerService', 'userRoleResolve', 'toastr', '$stateParams','$state'];

function subAdminCtrl(roleManagerResolve, RoleManagerService, userRoleResolve, toastr, $stateParams,$state) {
    var romc = this;
    if ($stateParams.id) {
        romc.action = 'Edit';
        romc.breadcrumb = 'SubMenu.SUB_ADMIN';
        romc.msg = 'Edited';
    } else {
        romc.action = 'Add';
        romc.breadcrumb = 'SubMenu.SUB_ADMIN';
        romc.msg = 'Added';

    }
    romc.privileges = [];
    romc.privileges = roleManagerResolve;

    if (userRoleResolve[0]) {
        romc.editSubAdminData = userRoleResolve[0];
        if (userRoleResolve[0].privileges.length > 0) {
            romc.privileges = userRoleResolve[0].privileges;
        }
    }

    var checking = true;
    for (var i = 0; i < romc.privileges.length; i++) {
        if (romc.privileges[i].status) {
            if (romc.privileges[i].status.view == false || romc.privileges[i].status.add == false || romc.privileges[i].status.edit == false || romc.privileges[i].status.delete == false) {
                checking = false;
            }
        } else {
            checking = false;
        }
    }

    if (checking == false) {
        romc.checkAll = false;
    } else {
        romc.checkAll = true;
    }

    romc.submitRoleManagerData = function submitRoleManagerData(isValid, data) {
        if (isValid && (data.length != 0)) {
            // userdata.privileges = data;
            RoleManagerService.RoleManagerActionCall(data).then(function (response) {

                toastr.success('Sub Admin '+romc.msg +' Successfully');
              $state.go('app.admins.sub');
            }, function (err) {
              if(err){
                toastr.error(err.message);
              }
                //toastr.error('Error' + err);
            });
        } else {
            toastr.error('form is invalid');
        }
    };


    romc.selectAllRoles = function selectAllRoles(value) {
        if (value) {
            for (var j = 0; j < romc.privileges.length; j++) {
                romc.privileges[j].status = {};
                romc.privileges[j].status.view = true;
                romc.privileges[j].status.add = true;
                romc.privileges[j].status.edit = true;
                romc.privileges[j].status.delete = true;
            }
        } else {
            for (var j = 0; j < romc.privileges.length; j++) {
                romc.privileges[j].status = {};
                romc.privileges[j].status.view = false;
                romc.privileges[j].status.add = false;
                romc.privileges[j].status.edit = false;
                romc.privileges[j].status.delete = false;
            }
        }
    }

    romc.mainMenuChange = function (menu, index) {
        var checking = true;
        for (var i = 0; i < romc.privileges.length; i++) {
            if (romc.privileges[i].status) {
                if (romc.privileges[i].status.view == false || romc.privileges[i].status.add == false || romc.privileges[i].status.edit == false || romc.privileges[i].status.delete == false) {
                    checking = false;
                }
            } else {
                checking = false;
            }
        }

        if (checking == false) {
            romc.checkAll = false;
        } else {
            romc.checkAll = true;
        }
    }

}
