angular.module('quickRabbit.paymentGateway').controller('paymentGatewayCtrl', paymentGatewayCtrl);
paymentGatewayCtrl.$inject = ['PaymentGatewayServiceResolve','PaymentGatewayService','$window','$scope'];

function paymentGatewayCtrl(PaymentGatewayServiceResolve,PaymentGatewayService,$window,$scope) {
  var tlc = this;
  tlc.permission =$scope.privileges.filter(function (menu) {
      return (menu.alias === "payment");
  }).map(function (menu) {
      return menu.status;
  })[0];
    var layout = [
        {
            name: 'Gateway Name',
            variable: 'gateway_name',
            template: '{{content.gateway_name}}',
            sort: 1
        },
        {
            name: 'Status',
            template: '<span ng-switch="content.status">' +
            '<span ng-switch-when="2">Disabled</span>' +
            '<span  ng-switch-when="1">Enabled</span>' +
            '</span>',
        },
        {
            name: 'Actions',
          //  template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ui-sref="app.paymentgateway.edit({id:content._id})"><i class="fa fa-edit"></i> <span>View</span></button>'
             template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.paymentgateway.edit({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>'
        }
    ];
    //var pgc = this;
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.module = 'earnings';
    tlc.table.data = PaymentGatewayServiceResolve[0];
    tlc.table.count = PaymentGatewayServiceResolve[1] || 0;
    tlc.table.delete = {'permission':tlc.permission,
        service: '', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            PaymentGatewayService.list(itemsPerPage, skip, sort, status, search).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1];
            });
        }
    };
    /* var pgc = this;
     pgc.layout = [{name:'Gateway Name',variable:'gateway_name',template:'{{content.gateway_name}}', sort:1},
        {name:'Status',template:'<span ng-switch="content.status">' +
                     '<span ng-switch-when="2">UnPublish</span>' +
                     '<span  ng-switch-when="1">Publish</span>' +
                    '</span>'},
        {   name: 'Actions',
            options: pgc.deleteBtn,
            template:'<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ui-sref="app.paymentgateway.edit({id:content._id})"><i class="fa fa-edit"></i> <span>View</span></button>'

        }];
    pgc.paymentGatewayList = PaymentGatewayServiceResolve[0];
    pgc.count = PaymentGatewayServiceResolve[1];

    pgc.paymentReload = function paymentReload(currentPage,itemsPerPage,sort,status,search){
        if(currentPage>=1) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            PaymentGatewayService.list(itemsPerPage,skip,sort,status,search).then(function (respo) {
                pgc.paymentGatewayList = respo[0];
            });
        }
    }; */

}
