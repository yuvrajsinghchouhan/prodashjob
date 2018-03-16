angular.module('quickRabbit.reviews').controller('viewReviewsCtrl', viewReviewsCtrl);

viewReviewsCtrl.$inject = ['ReviewsServiceResolve', 'ReviewsService', '$scope'];

function viewReviewsCtrl(ReviewsServiceResolve, ReviewsService, $scope) {
    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "reviews");
    }).map(function (menu) {
        return menu.status;
    })[0];
      if (ReviewsServiceResolve[2]) {
        tlc.allValue = ReviewsServiceResolve[2].allValue || 0;
        tlc.userValue = ReviewsServiceResolve[2].userValue || 0;
        tlc.taskerValue = ReviewsServiceResolve[2].taskerValue || 0;
      }

    $scope.statusValue = 'all';
    tlc.statusPass = function statusPass(type,limit,skip) {
        $scope.statusValue = type;
        if (type == 'all' || type == 'user' || type == 'tasker') {
            ReviewsService.getReviewsList(type,limit,skip).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1] || 0;
                if (respo[2]) {
                    tlc.allValue = respo[2].allValue || 0;
                    tlc.userValue = respo[2].userValue || 0;
                    tlc.taskerValue = respo[2].taskerValue || 0;
                    }
            });
        }
    };


    var layout = [
        {
            name: 'Review',
            template: '<rating readonly="true" ng-model="content.rating" max="5"></rating>',
            sort: 1,
            variable: 'rating',
        },
        {
            name: 'Reviewed By',
            template: '<span>{{content.usertasker.username}} </span>',
            sort: 1,
            variable: 'user',
        },
        {
            name: 'Type',
            template: '{{content.type}}'
        },
        {
            name: 'Task ID',
            template: '{{content.task[0].booking_id}}'
        },
        {
            name: 'Actions',
            // template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.reviews.action({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            // '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.reviews.action({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
        }
    ];
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = ReviewsServiceResolve[0];
    tlc.table.count = ReviewsServiceResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission, service: '/reviews/deletereviews', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            ReviewsService.getReviewsList($scope.statusValue,itemsPerPage, skip, sort, status, search).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1];
            });
        }
    };
}
