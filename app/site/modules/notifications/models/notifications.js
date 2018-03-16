var app = angular.module('quickRabbit.notifications');
app.factory('NotificationService', NotificationService);
function NotificationService($http, $q) {
    var NotificationService = {
        getMessage: getMessage
    };
    return NotificationService;

    function getMessage(data, page , itemsPerPage) {
      var skip = 0;
      if (page > 1) {
          var skip = (parseInt(page) - 1) * itemsPerPage;
      }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/notifications/list',
            data: { data: data, skip: skip, itemsCount: itemsPerPage }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

}
