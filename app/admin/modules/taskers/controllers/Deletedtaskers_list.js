angular.module('quickRabbit.taskers').controller('deletedTaskerCtrl', deletedTaskerCtrl);

deletedTaskerCtrl.$inject = ['deletedtaskersServiceResolve', 'TaskersService', '$scope'];

function deletedTaskerCtrl(deletedtaskersServiceResolve, TaskersService, $scope) {

    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "tasker");
    }).map(function (menu) {
        return menu.status;

    })[0];

    var layout = [
        {
            name: 'Username',
            variable: 'username',
            sort: 1,
            template: '{{content.username}}'

        },
        { name: 'Email', template: '{{content.email}}', sort: 1, variable: 'email', },
        {
            name: 'Status ',
            template:
            '<span  ng-switch="content.status">' +
            '<span  ng-switch-when="0">Deleted</span>' +
            '</span>'
        },
        { name: 'Deleted Date', variable: 'updatedAt', sort: 1, template: '{{content.updatedAt | clock : options.date}}' },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.taskers.edit({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' /* +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>' */
        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = deletedtaskersServiceResolve[0];
    tlc.table.count = deletedtaskersServiceResolve[1] || 0;
    tlc.table.delete = {
        'date': $scope.date, 'permission': tlc.permission, service: '/taskers/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                TaskersService.getDeletedTaskers($scope.statusValue, itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];
                });
            }
        }
    };
}
