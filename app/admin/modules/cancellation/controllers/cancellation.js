angular.module('quickRabbit.cancellation').controller('cancellationCtrl', cancellationCtrl);

cancellationCtrl.$inject = ['cancellationResolve', 'cancellationService', '$scope'];

function cancellationCtrl(cancellationResolve, cancellationService, $scope) {

    var cal = this;
    cal.permission=$scope.privileges.filter(function (menu) {
        return (menu.alias === "cancellation");
    }).map(function (menu) {
        return menu.status;
    })[0];

    var layout = [

        {
          name: 'Reason',
          template: '{{content.reason}}',
        },
        {
          name: 'Type',
          template: '{{content.type}}',
          variable:'type',
          sort:1
        },
        {
          name: 'Status ',
          template:
          '<div ng-if="content.status==2">Inactive</div> ' +
          '<div ng-if="content.status==1">Active </div>'

        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.cancellation.edit({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'


        }
    ];
    //var vtc = this;
    cal.table = {};
    cal.table.layout = layout;
    cal.table.data = cancellationResolve[0];
    cal.table.count = cancellationResolve[1] || 0;
    cal.table.delete = {
        'permission': cal.permission, service: '/cancellation/deletecancellation', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            cancellationService.getCancellationList(itemsPerPage, skip, sort,status, search).then(function (respo) {
                cal.table.data = respo[0];
                cal.table.count = respo[1];
            });
        }
    };

}
