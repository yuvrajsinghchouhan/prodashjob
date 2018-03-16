angular.module('quickRabbit.task').controller('taskProfileCtrl', taskProfileCtrl);
taskProfileCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', '$uibModal', 'TaskService', 'TaskProfileResolve', 'toastr', '$state', '$translate'];
function taskProfileCtrl($scope, $rootScope, $location, $stateParams, $uibModal, TaskService, TaskProfileResolve, toastr, $state, $translate) {
    var tpc = this;

    if (angular.isDefined($stateParams.taskerId)) {
        tpc.taskerId = $stateParams.taskerId;
    }
    /*
    if (angular.isDefined($stateParams.slug)) {
        tpc.slug = $stateParams.slug;
    }
    if (angular.isDefined($stateParams  .task)) {
        tpc.task = $stateParams.task;
    }
    */
    //tpc.currentUserId = CurrentuserResolve.user_id;
    tpc.taskDetailInfo = {};
    tpc.availableSymbal = false;

    if (TaskProfileResolve) {
        if (TaskProfileResolve.location) {
            var latlng = new google.maps.LatLng(TaskProfileResolve.location.lat, TaskProfileResolve.location.lng);
            var geocoder = geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        if (TaskProfileResolve.availability_address) {
                            TaskProfileResolve.availability_address = TaskProfileResolve.availability_address;
                        } else {
                            TaskProfileResolve.availability_address = results[1].formatted_address;
                        }
                    }
                }
            })
        }

        tpc.taskDetailInfo = TaskProfileResolve;
        if (tpc.taskDetailInfo.availability == 0) {
            tpc.availabilityValue = "Tasker is Unavailable";
            tpc.availableSymbal = false;
        } else {
            tpc.availabilityValue = "Tasker is Available";
            tpc.availableSymbal = true;
        }
        tpc.questionValue = "Tasker has not provided any details";
        tpc.answerValue = "Answer is Unavailable";

        if (tpc.taskDetailInfo.profile_details[0]) {
            if (tpc.taskDetailInfo.profile_details[0].answer) {
                tpc.checkVAlue = 1;
                tpc.answerValue = tpc.taskDetailInfo.profile_details;
            }
            if (tpc.taskDetailInfo.profile_details[0].question) {
                tpc.questionValue = tpc.taskDetailInfo.profile_details;
            }
        }
    } else {
        $translate('WE ARE LOOKING FOR THIS TROUBLE SORRY UNABLE TO FETCH DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        $state.go('landing');
    }

    TaskService.taskerreviews(tpc.taskerId).then(function (response) {
        if (response[0]) {
            tpc.taskprofile = response[0];
			console.log("tpc.taskprofile", tpc.taskprofile)
            tpc.taskertempid = tpc.taskprofile[0]._id;

            tpc.profilelength = tpc.taskprofile.length;
            tpc.overallRating = 0;
            angular.forEach(tpc.taskprofile, function (value, key) {
                if (value.rate) {
                    tpc.overallRating = tpc.overallRating + value.rate.rating;
                }
            });
            tpc.overallrate = tpc.overallRating / tpc.profilelength;

            if (tpc.taskprofile[0].createdAt) {
                tpc.convertdate = new Date(tpc.taskprofile[0].createdAt);
            }
            tpc.dateConversion = tpc.convertdate.getFullYear();
            tpc.induvidualrating = parseInt(response[1]);
        }
    }, function (err) {
        toastr.error(err);
    });


}
