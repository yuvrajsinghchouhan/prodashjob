angular.module('quickRabbit.earnings').controller('viewearningsCtrl', viewearningsCtrl);

viewearningsCtrl.$inject = ['$scope', 'TaskerEarningReslove', 'toastr', 'EarningService', 'PaidEarningsServiceResolve', '$stateParams'];
function viewearningsCtrl($scope, TaskerEarningReslove, toastr, EarningService, PaidEarningsServiceResolve, $stateParams) {
    var encc = this;
    $scope.taskerId = $stateParams.id;

    encc.billingCycle = $stateParams.cycle;

    encc.eraninglist = TaskerEarningReslove[0];
    encc.payDetails = PaidEarningsServiceResolve;
    if (encc.payDetails.total.extra_amount) {
        encc.payDetails.tasker_extra_amount = encc.payDetails.total.extra_amount;
    }
    else {
        encc.payDetails.tasker_extra_amount = 0;
    }

    encc.amtWithTasker = encc.payDetails.cash.admin_commission + encc.payDetails.cash.servicetax;

    encc.amtWithAdmin = (encc.payDetails.gateway.total - encc.payDetails.gateway.admin_commission) + (encc.payDetails.gateway.extra_amount);

    var amounttosettle = {};
    if (encc.amtWithAdmin > encc.amtWithTasker) {
        amounttosettle.by = "admin";
        amounttosettle.to = "tasker";
        amounttosettle.amount = encc.amtWithAdmin - encc.amtWithTasker;
    } else {
        amounttosettle.by = "tasker";
        amounttosettle.to = "admin";
        amounttosettle.amount = encc.amtWithTasker - encc.amtWithAdmin;
    }
    encc.amounttosettle = amounttosettle;

    var layout = [
        {
            name: 'Task id',
            template: '{{content.booking_id}}'
        },
        {
            name: 'Task',
            template: '{{content.booking_information.service_type }}'
        },
        {
            name: 'Total',
            template: '{{content.invoice.amount.total| money : options.currency }}'
        },
        {
            name: 'Service Tax',
            template: '{{content.invoice.amount.service_tax | money : options.currency}}'
        },
        {
            name: 'Coupon Amount',
            template: '<span ng-if="content.invoice.amount.coupon"><span>{{content.invoice.amount.coupon | money : options.currency}}</span></span>' +
            '<span ng-if="!content.invoice.amount.coupon"><span> {{ 0| money : options.currency}}</span></span>'
        },
        {
            name: 'Miscellaneous Charges',
            template: '<span ng-if="content.invoice.amount.extra_amount"><span>{{content.invoice.amount.extra_amount | money : options.currency}}</span></span>' +
            '<span ng-if="!content.invoice.amount.extra_amount"><span> {{ 0| money : options.currency}}</span></span>'
        },
        {
            name: 'Grand Total',
            template: '{{content.invoice.amount.grand_total | money : options.currency}}'
        },
        {
            name: 'Admin Commission',
            template: '{{content.invoice.amount.admin_commission | money : options.currency}}'
        },
        {
            name: 'Tasker',
            template: '{{(content.invoice.amount.total - content.invoice.amount.admin_commission) | money : options.currency}}'
        },
        {
            name: 'Payment Type',
            template: '{{content.payment_type}}'
        },
        {
            name: 'Paid',
            template: "{{content.payee_status == '1' ? 'Yes' : 'No' }}"
        }
    ];
    encc.table = {};
    encc.table.module = 'earnings';
    encc.table.layout = layout;
    encc.table.data = TaskerEarningReslove[0];
    encc.table.count = encc.table.data.length;
    encc.table.delete = {
        'date': $scope.date,
        'permission': encc.permission,
        'currency': $scope.currency,
        service: '/tasks/deletequestion',
        getData: function (currentPage, itemsPerPage, sort, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            var data = {};
            data.tasker = $stateParams.id;
            data.cycle = $stateParams.cycle;
            EarningService.getTaskrearning(data, itemsPerPage, skip, sort, search).then(function (respo) {
                encc.table.data = respo[0];
            });
        }
    };

    encc.paytasker = function paytasker() {
        var data = {};
        data.tasker = encc.payDetails.tasker._id;
        data.billing_cycle = encc.billingCycle;
        data.invoice = {};
        data.invoice.cash = encc.payDetails.cash;
        data.invoice.gateway = encc.payDetails.gateway;
        data.invoice.total = encc.payDetails.total;
        data.task_count = encc.payDetails.count;
        data.payment = encc.amounttosettle;

        EarningService.updatepayee(data).then(function (response) {
            encc.payDetails.total.paid_count = encc.payDetails.total.paid_count + response.nModified;
            toastr.success('Payment Successfully Updated');
        }, function (err) {
            toastr.error('Unable to save your data');
        });
    };
}
