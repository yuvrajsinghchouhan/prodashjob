angular.module('quickRabbit.pushnotification').controller('NotificationListCtrl', NotificationListCtrl);

NotificationListCtrl.$inject = ['$scope', 'NotificationListServiceResolve', 'notificationListService'];

function NotificationListCtrl($scope, NotificationListServiceResolve, notificationListService) {
    var nlc = this;
    // --- Privileges
    nlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "notification");
    }).map(function (menu) {
        return menu.status;
    })[0];
    // --- Privileges
    var layout = [
        {
            name: 'Name',
            variable: 'name',
            template: '{{content.name}}',
            sort: 1
        },
        {
            name: 'Type',
            variable: 'type',
            template: '{{content.notificationtype}}',
            sort: 1
        },
        {
            name: 'Actions',
            template:
            '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false " ui-sref="app.pushnotifications.email({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>'
            + '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'

        }
    ];

    nlc.table = {};
    nlc.table.layout = layout;
    nlc.table.data = NotificationListServiceResolve[0];
    nlc.table.count = NotificationListServiceResolve[1] || [0];
    nlc.table.delete = {
        'permission': nlc.permission, service: '/notification/deletenotification', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                notificationListService.getNotificationsList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                    nlc.table.data = respo[0];
                    nlc.table.count = respo[1];
                });
            }
        }
    };
}
