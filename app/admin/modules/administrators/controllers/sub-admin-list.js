angular.module('quickRabbit.administrator').controller('subAdminsListCtrl', subAdminsListCtrl);

subAdminsListCtrl.$inject = ['subAdminsServiceResolve', 'AdminsService', '$scope'];

function subAdminsListCtrl(subAdminsServiceResolve, AdminsService, $scope) {
    //var alc = this;
    var tlc = this;
    tlc.permission =$scope.privileges.filter(function (menu) {
        return (menu.alias === "administrators");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
                name: 'Username',
                template: '{{content.username}}',
                sort: 1,
                variable: 'username',
        },
        {
                template: '{{content.email}}',
                name: 'Email',
                sort: 1,
                variable: 'email',
       },
        { name: 'Last Login Date', template: '{{content.activity.last_login | clock : options.date}}' },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.admins.subadd({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = subAdminsServiceResolve[0];
    tlc.table.count = subAdminsServiceResolve[1] || 0;
    tlc.table.delete = {'permission':tlc.permission,
        'date': $scope.date, service: '/admins/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                AdminsService.getAllSubAdmins(itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];
                });
            }
        }
    };
}
