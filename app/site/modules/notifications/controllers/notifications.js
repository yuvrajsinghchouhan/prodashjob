angular.module('quickRabbit.notifications').controller('notificationCtrl', notificationCtrl);

notificationCtrl.$inject = ['NotificationsResolve', 'NotificationService', 'toastr', '$rootScope','$translate'];
function notificationCtrl(NotificationsResolve, NotificationService, toastr, $rootScope,$translate) {
    var nc = this;
    nc.itemsPerPage = 3;
  	nc.currentPage  = 1;
  	nc.totalItems   = 0;
    nc.notifications = NotificationsResolve;
    if(nc.notifications[0]){
      nc.totalItems = nc.notifications[0].count;
    }
    $rootScope.$emit('webNotification', { user: $rootScope.userId, type: $rootScope.usertype });
    var data = {};
    data.user = $rootScope.userId;
    data.type = $rootScope.usertype;
    nc.getnotification = function () {
      nc.notification = [];
        nc.getnotificationResponse = false;
        NotificationService.getMessage(data, nc.currentPage, nc.itemsPerPage).then(function (data) {
          nc.notifications = data;
        }, function (error) {
        });
    };
}
