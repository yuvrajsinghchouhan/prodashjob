angular.module('quickRabbit.pages').controller('pagesListCtrl',pagesListCtrl);
pagesListCtrl.$inject = ['PageListServiceResolve','PageService', '$modal', '$scope'];

function pagesListCtrl(PageListServiceResolve, PageService, $modal, $scope){
      var plc = this;
      // --- Privileges
      plc.permission =$scope.privileges.filter(function (menu) {
          return (menu.alias === "page");
      }).map(function (menu) {
          return menu.status;
      })[0];
      // --- Privileges


    var layout = [
        {
            name:'Page Name',
            variable:'name',
            template:'{{content.name}}',
            sort:1
        },
        {
            name:'Published On',
            template:'{{ content.createdAt | clock : options.date }}'
        },
        {
            name:'Status ',
            template:'<div ng-if="content.status==1">Publish</div>' +
            '<div ng-if="content.status==2">Unpublish</div>'
        },
        {
            name: 'Actions',
             template:'<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.pages.action({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
             '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>' +
             '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.pages.subpageslist({action:"edit",id:content._id})><i class="fa fa-eye"></i> <span>Languages</span></button>'

        }
    ];

    plc.table = {};
    plc.table.layout = layout;
    plc.table.data = PageListServiceResolve[0];
    plc.table.count = PageListServiceResolve[1] || 0;
    plc.table.delete = {'permission': plc.permission, 'date' : $scope.date, 'service':'/pages/deletepage', 'getData':function (currentPage, itemsPerPage, sort, status, search) {
        var skip = (parseInt(currentPage) - 1) * itemsPerPage;
        PageService.getPageList(itemsPerPage, skip, sort, status, search).then(function(respo) {
            plc.table.data = respo[0];
            plc.table.count = respo[1];
        });
    }};

}
