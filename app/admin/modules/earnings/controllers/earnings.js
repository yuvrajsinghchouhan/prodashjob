angular.module('quickRabbit.earnings').controller('earningsCtrl', earningsCtrl);

earningsCtrl.$inject = ['FirstCycleServiceResolve', 'CycleServiceResolve', 'TasksServiceResolve', 'EarningsServiceResolve', 'EarningService', '$scope'];

function earningsCtrl(FirstCycleServiceResolve, CycleServiceResolve, TasksServiceResolve, EarningsServiceResolve, EarningService, $scope) {
    var enc = this;
    enc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "earnings");
    }).map(function (menu) {
        return menu.status;
    })[0];

    var layout = [
        {
            name: 'Earnings',
            variable: 'username',
            template: '{{content.tasker.username}}',
            sort: 1
        },
        {
            name: 'Total Task',
            template: '{{content.count}}'
        },
        {
            name: 'Total',
            template: '{{content.total | money : options.currency}}'
        },
        {
            name: 'Coupon Amount',
            template: '{{content.coupon | money : options.currency }}'
        },
        {
            name: 'Service Tax',
            template: '{{content.servicetax | money : options.currency }}'
        },
        {
            name: 'Grand Total',
            template: '{{content.grandtotal| money : options.currency}}'
        },
        {
            name: 'Site Earnings',
            template: '{{content.admin_commission| money : options.currency}}'
        },
        {
            name: 'Tasker Earnings',
            template: '{{content.total - content.admin_commission| money : options.currency}}'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.view != false" ui-sref=app.earnings.view({action:"edit",id:content._id,cycle:options.cycle})><i class="fa fa-edit"></i> <span>View</span></button>'
        }
    ];

    enc.table = {};
    enc.table.module = 'earnings';
    enc.table.layout = layout;
    enc.table.data = EarningsServiceResolve[0];
    enc.task = TasksServiceResolve;
    enc.firstcycledata = FirstCycleServiceResolve;
    enc.cycledata = CycleServiceResolve;

    enc.tillnow = moment.tz(new Date(), $scope.date.timezone).format($scope.date.format);
    if (enc.cycledata.length <= 0) {
        if (enc.task.createdAt) {
            enc.billcycledate = moment.tz(new Date(enc.task.createdAt), $scope.date.timezone).format($scope.date.format);
        } else {
            enc.billcycledate = "";
        }
    } else {
        if (enc.firstcycledata) {
            var myString = enc.firstcycledata.billingcycyle;
            var myArray = myString.split('-');
            enc.billcycledate = moment.tz(new Date(myArray[1]), $scope.date.timezone).format($scope.date.format);
        }
    }


    enc.currentdate = new Date();
    enc.cday = enc.currentdate.getDate();
    enc.sday = enc.currentdate.getDate();
    enc.smonthIndex = enc.currentdate.getMonth() + 1;
    enc.syear = enc.currentdate.getFullYear();
    enc.table.count = EarningsServiceResolve[1] || 0;
    enc.table.delete = {
        'cycle': enc.selected,
        'permission': enc.permission,
        'currency': $scope.currency,
        service: '/tasks/deletequestion',
        'getData': function (currentPage, itemsPerPage, sort, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            EarningService.getEarningList(itemsPerPage, skip, sort, search).then(function (respo) {
                enc.table.data = respo[0];
                enc.table.count = respo[1];
            });
        }
    };


    enc.replacelist = function replacelist() {
        enc.table.layout = layout;
        EarningService.getEarningList(10, 0, 0, undefined, enc.selected).then(function (response) {
            enc.table.data = response[0];
            enc.table.count = response[1];
            enc.table.delete.cycle = enc.selected;
        });
    }
}
