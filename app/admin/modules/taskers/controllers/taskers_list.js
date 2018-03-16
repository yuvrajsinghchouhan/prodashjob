angular.module('quickRabbit.taskers').controller('taskersListCtrl', taskersListCtrl);

taskersListCtrl.$inject = ['taskersServiceResolve', 'TaskersService', '$scope','toastr'];

function taskersListCtrl(taskersServiceResolve, TaskersService, $scope,toastr) {

    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "tasker");
    }).map(function (menu) {
        return menu.status;

    })[0];

    if (taskersServiceResolve[2]) {
        tlc.allValue = taskersServiceResolve[2].allValue || 0;
        tlc.verifiedValue = taskersServiceResolve[2].verifiedValue || 0;
        tlc.unverifiedValue = taskersServiceResolve[2].unverifiedValue || 0;
        tlc.pendingValue = taskersServiceResolve[2].pendingValue || 0;
    }

    $scope.statusValue = 0;
    tlc.statusPass = function statusPass(status,limit,skip) {
        $scope.statusValue = status;
        if (status == 1 || status == 2 || status == 3 || status == 0) {
            TaskersService.getAllTaskers(status,limit,skip).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1] || 0;
                if (respo[2]) {
                    tlc.allValue = respo[2].allValue || 0;
                    tlc.verifiedValue = respo[2].verifiedValue || 0;
                    tlc.unverifiedValue = respo[2].unverifiedValue || 0;
                    tlc.pendingValue = respo[2].pendingValue || 0;
                }
            });
        }
    };
    TaskersService.getSettings().then(function (response) {
      tlc.getsetting = response;
    });
    tlc.exporttasker = function exporttasker() {
    TaskersService.exporttaskerData('Taskers').then(function (response) {
      if (response.error) {
        toastr.error('No data found to export');
      } else {
        window.location.href = tlc.getsetting.site_url + "tools/exporttasker";
      }
    }, function (err) {
      toastr.error(err);
    });
};
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
            '<span  ng-switch-when="1">Verified</span>' +
            '<span  ng-switch-when="2">Unverified</span>' +
            '<span  ng-switch-when="3">Pending</span>' +
            '</span>'
        },
        { name: 'Last Login Date', variable: 'updatedAt', sort: 1, template: '{{content.updatedAt | clock : options.date}}' },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.taskers.edit({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;

    tlc.table.data = taskersServiceResolve[0];

    tlc.table.count = taskersServiceResolve[1] || 0;
    tlc.table.delete = {
        'date': $scope.date, 'permission': tlc.permission, service: '/taskers/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                TaskersService.getAllTaskers($scope.statusValue, itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];
                });
            }
        }
    };
}
