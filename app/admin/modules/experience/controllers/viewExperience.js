angular.module('quickRabbit.experience').controller('experienceListCtrl', experienceListCtrl);

experienceListCtrl.$inject = ['experienceServiceResolve', 'ExperienceService', '$scope'];

function experienceListCtrl(experienceServiceResolve, ExperienceService, $scope) {
    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "experience");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'Name',
            variable: 'name',
            template: '{{content.name}}',
            sort: 1
        },
        {
            name: 'Status ',
            template:
            '<span  ng-switch="content.status">' +
            '<span  ng-switch-when="1">Publish</span>' +
            '<span  ng-switch-when="2">UnPublish</span>' +
            '<span  ng-switch-when="3">Pending</span>' +
            '</span>'
        },
        { name: 'Date', template: '{{content.updatedAt| clock : options.date }}' },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.tasker_management.experience.edit({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = experienceServiceResolve[0];
    tlc.table.count = experienceServiceResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission, 'date': $scope.date, service: '/experience/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                ExperienceService.getExperienceList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];

                });
            }
        }
    };
}
