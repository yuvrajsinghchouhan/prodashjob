angular.module('quickRabbit.newsletter').controller('SubscriberListCtrl',SubscriberListCtrl);
SubscriberListCtrl.$inject = ['SubscriberServiceResolve','SubscriberService','MainService','SubscriberMail','$window','$modal','$scope'];

function SubscriberListCtrl(SubscriberServiceResolve,SubscriberService,MainService,SubscriberMail,$window, $modal,$scope){

  var tlc = this;
  tlc.permission =$scope.privileges.filter(function (menu) {
      return (menu.alias === "newsletter");
  }).map(function (menu) {
      return menu.status;
  })[0];
    var layout = [
        {
            name:'Subscriber',
            variable:'email',
            template:'{{content.email}}',
            sort:1
        },
        {
            name:'Date',
            variable:'createdAt',
            template:'{{content.createdAt | date}}',
            sort:1
        },
        {
            name: 'Actions',
             template:'<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'

        }
    ];


    //var etlc = this;
    tlc.table = {};
    tlc.table.SubscriberMail = SubscriberMail;
    tlc.table.layout = layout;
    tlc.table.data = SubscriberServiceResolve[0];
    tlc.table.count = SubscriberServiceResolve[1] || 0;
    tlc.table.delete = {'permission':tlc.permission,service:'/newsletter/subscriber/delete', getData:function (currentPage, itemsPerPage, sort, status, search) {
        var skip = (parseInt(currentPage) - 1) * itemsPerPage;
        SubscriberService.getSubscriberList(itemsPerPage, skip, sort, status, search).then(function(respo) {
            tlc.table.data = respo[0];
            tlc.table.count = respo[1];
        });
    }};


}
