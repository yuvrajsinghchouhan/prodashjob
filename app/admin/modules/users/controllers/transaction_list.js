angular.module('quickRabbit.users').controller('transactionListCtrl', transactionListCtrl);

transactionListCtrl.$inject = ['usersTransactionServiceResolve', 'UsersService', '$scope', 'MainService', '$stateParams'];

function transactionListCtrl(usersTransactionServiceResolve, UsersService, $scope, MainService, $stateParams) {


    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "users");
    }).map(function (menu) {
        return menu.status;
    })[0];
    tlc.id = $stateParams.id;
    tlc.name = "Transaction List";
    tlc.table = {};
    if (usersTransactionServiceResolve.status == 0) {
        tlc.table.count = 0;
    } else {
        tlc.table.data = usersTransactionServiceResolve.response.trans;
        tlc.table.count = usersTransactionServiceResolve.response.count || 0;
    }

    var layout = [
        {
            name: 'Title',
            template: '{{content.title}}',
             sort: 1
        },
        {
            name: 'Transaction Amount',
            template: '{{content.trans_amount  | currency}}',
        },
        {
            name: 'Balance Amount',
            template: '{{content.balance_amount  | currency}}',
        },
        {
            name: 'Transaction Type',
            template: '{{content.type}}',
            sort: 1,
            variable: 'type',
        },
        {
            name: 'Transaction Date',
            template: '{{content.trans_date | clock : options.date}}',
            variable: 'trans_date'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false"  ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];
    tlc.table.layout = layout;
    tlc.table.module = 'earnings';
    tlc.table.search = 'hide';

    tlc.table.delete = {
        'permission': tlc.permission,
        'date': $scope.date,
        service: '/users/transaction/delete', getData: function (currentPage, itemsPerPage, sort, search,status) {
            console.log("currentPage, itemsPerPage, sort, search,status",currentPage, itemsPerPage, sort, search ,status);
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                UsersService.transactionsList($stateParams.id, itemsPerPage, skip, sort, search ,status).then(function (respo) {
                  console.log(respo);
                    tlc.table.data = respo.response.trans;
                    tlc.table.count = respo.response.count;

                });
            }
        }
    };
}
