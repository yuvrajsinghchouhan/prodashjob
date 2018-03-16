angular.module('quickRabbit.reviews').controller('editReviewsCtrl', editReviewsCtrl);

editReviewsCtrl.$inject = ['ReviewsEditReslove', 'ReviewsService', 'toastr', '$state'];
function editReviewsCtrl(ReviewsEditReslove, ReviewsService, toastr, $state) {
    var edrc = this;
    edrc.editReviewData = ReviewsEditReslove[0];

    edrc.submit = function submit(isValid) {
        
        if (isValid) {
            ReviewsService.save(edrc.editReviewData).then(function (response) {
                toastr.success('Review Added Successfully');
                $state.go('app.reviews.list');
            }, function (err) {
               // toastr.error(err[0].msg);
            });
        } else {
            toastr.error('form is invalid');
        }
    };
}

