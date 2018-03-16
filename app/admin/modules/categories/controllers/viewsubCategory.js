angular.module('quickRabbit.categories').controller('subcategoryListCtrl', subcategoryListCtrl);

subcategoryListCtrl.$inject = ['CategoryServiceResolve', 'CategoryService', '$scope'];

function subcategoryListCtrl(CategoryServiceResolve, CategoryService, $scope) {
    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "categories");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'Category Name',
            variable: 'name',
            template: '{{content.name}}',
            sort: 1
        },
        { name: 'Category Image', template: '<img ng-src="{{content.image}}" alt="" class="size-50x50" style="border-radius: 0%;">' },
        { name: 'Parent', variable: 'parentName', template: '{{content.categoryName[0].name}}' },
        {
            name: 'Status', template: '<span ng-switch="content.status">' +
            '<span  ng-switch-when="1">Publish</span>' +
            '<span  ng-switch-when="2">UnPublish</span>' +
            '</span>'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.categories.sub({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'


        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = CategoryServiceResolve[0];
    tlc.table.count = CategoryServiceResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission, service: '/category/deletecategory', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                CategoryService.subCategoryList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];
                });
            }
        }
    };
}
