var app = angular.module('quickRabbit.pushnotification');
app.factory('notificationListService',notificationListService);
notificationListService.$inject = ['$http','$q'];

function notificationListService($http,$q){
    var notificationListService = {
        getNotificationsList:getNotificationsList,
        getNotificationemail:getNotificationemail
    };
    return notificationListService;

    function getNotificationsList(limit,skip,sort,search){
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/notification/email-template/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getNotificationemail(id){
		var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/notification/email-template/edit',
			data:data
        }).success(function(data){
            deferred.resolve([data]);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    };

}
