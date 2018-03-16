
angular.module('quickRabbit.languages').controller('languageSettingsListCtrl', languageSettingsListCtrl);
languageSettingsListCtrl.$inject = ['languageServiceListResolve', 'languageService', 'MainService', 'toastr', '$window', '$modal', '$scope'];
function languageSettingsListCtrl(languageServiceListResolve, languageService, MainService, toastr, $window, $modal, $scope) {
    var tlc = this;

    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "settings");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'Language Name',
            template: '{{content.name}}',
            variable: 'name',
            sort: 1
        },
        {
            name: 'Language Code',
            template: '{{content.code}}'
        },
        {
            name: 'Default',
            type: 'language'
        },
        {
            name: 'Status',
            template: '<span ng-switch="content.status">' +
            '<span ng-switch-when="2">Unpublish</span>' +
            '<span  ng-switch-when="1">Publish</span>' +
            '</span>'
        },

        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.settings.languageSettings.action({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.settings.languageSettings.manage({langId:content.code})"><i class="fa fa-edit"></i> <span>Manage</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = languageServiceListResolve[0];
    tlc.table.count = languageServiceListResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission,
        service: '/settings/language/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            languageService.getLanguageList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1];
            });
        },
        language: {
            default: $scope.defaultLanguage, change: function markDefault(id) {
                languageService.selectDefault(id).then(function (response) {
                    if (response.status == 400) {
                        toastr.error(response.message);
                    } else {
                        toastr.success('Default Language Changed');
                        location.reload();
                        //$route.reload();
                    }
                }, function (err) {
                    toastr.error(err);
                });
            }
        }
    };


}
