angular.module('quickRabbit.users').controller('usersListCtrl', usersListCtrl);

usersListCtrl.$inject = ['usersServiceResolve', 'UsersService', '$scope', 'MainService','toastr'];

function usersListCtrl(usersServiceResolve, UsersService, $scope, MainService,toastr) {

    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "users");
    }).map(function (menu) {
        return menu.status;
    })[0];

     if (usersServiceResolve[2]) {
        tlc.allValue = usersServiceResolve[2].allValue || 0;
        tlc.activeValue = usersServiceResolve[2].activeValue || 0;
        tlc.deactivateValue = usersServiceResolve[2].deactivateValue || 0;
      }

    $scope.statusValue = 0;
    tlc.statusPass = function statusPass(status,limit,skip) {
        $scope.statusValue = status;
        if (status == 1 || status == 2 || status == 0) {
            UsersService.getAllUsers(status,limit,skip).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1] || 0;
                if (respo[2]) {
                    tlc.allValue = respo[2].allValue || 0;
                    tlc.activeValue = respo[2].activeValue || 0;
                    tlc.deactivateValue = respo[2].deactivateValue || 0;
                    }
            });
        }
    };
    UsersService.getSettings().then(function (response) {
  		tlc.getsetting = response;
  	});
    tlc.exportuser = function exportuser() {
      UsersService.exportuserData('User').then(function (response) {
        if (response.error) {
          toastr.error('No data found to export');
        } else {
          window.location.href = tlc.getsetting.site_url + "tools/exportuser";
        }
      }, function (err) {
        toastr.error(err);
      });
    }

    var layout = [
        {
            name: 'Username',
            template: '{{content.username}}',
            sort: 1,
            variable: 'username',
        },
        {
            name: 'Email',
            template: '{{content.email}}',
            sort: 1,
            variable: 'email',
        },
        {
            name: 'Status ',
            template:
            '<span  ng-switch="content.status">' +
            '<span  ng-switch-when="1">Active</span>' +
            '<span  ng-switch-when="2">In-Active</span>' +
            '</span>'
        },
        {
            name: 'Last Login Date',
            template: '{{content.updatedAt | clock : options.date}}',
            sort: 1,
            variable: 'updatedAt'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b"  ng-if="options.permission.edit != false"  ui-sref="app.users.add({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false"  ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = usersServiceResolve[0];
    tlc.table.count = usersServiceResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission,
        'date': $scope.date,
        service: '/users/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            //console.log("currentPage, itemsPerPage, sort, status, search",currentPage, itemsPerPage, sort, status, search);
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                UsersService.getAllUsers($scope.statusValue,itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];

                });
            }
        }
    };

}
