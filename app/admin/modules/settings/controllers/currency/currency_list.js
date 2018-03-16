var app = angular.module('quickRabbit.currencies');
app.controller('currencySettingsListCtrl', currencySettingsListCtrl);
currencySettingsListCtrl.$inject = ['CurrencyServiceResolve', 'CurrencyService', 'toastr', '$window', '$modal', 'MainService', '$scope'];

function currencySettingsListCtrl(CurrencyServiceResolve, CurrencyService, toastr, $window, $modal, MainService, $scope) {
    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "settings");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'Currency Name',
            template: '{{content.name}}',
            sort: 1,
            variable: 'name',
        },
        {
            name: 'Currency Code',
            template: '{{content.code}}'
        },
        {
            name: 'Currency Symbol ',
            template: '{{content.symbol}}'
        },
        {
            name: 'Default',
            type: 'currency'
        },
        {
            name: 'Status ',
            template: '<span ng-switch="content.status">' +
            '<span ng-switch-when="2">Unpublish</span>' +
            '<span  ng-switch-when="1">Publish</span>' +
            '</span>'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.settings.currencySettings.add({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'

        }
    ];
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = CurrencyServiceResolve[0];
    tlc.table.count = CurrencyServiceResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission,
        service: '/settings/currency/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            CurrencyService.getProductList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1];
            });
        },
        currency: {
            default: $scope.defaultCurrency, change: function markDefault(id) {
                CurrencyService.selectDefault(id).then(function (response) {
                    toastr.success('Default Currency Changed');
                }, function (err) {
                    toastr.error('Unable to save your data');
                });
            }
        }
    };

}
