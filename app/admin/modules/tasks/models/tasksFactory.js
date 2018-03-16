var app = angular.module('quickRabbit.tasks');

app.factory('TasksService',TasksService);

TasksService.$inject = ['$http','$q', 'Upload'];

function TasksService($http, $q, Upload){


    var TasksService = {
        getTasksList:getTasksList,
        getDeletedTasksList:getDeletedTasksList,
        getTasks:getTasks,
        exportData: exportData,
        getTasksExport:getTasksExport,
        save:save,
        getTransaction:getTransaction,
        getSettings:getSettings
    };

    return TasksService;

    function getTasksExport(){
        var deferred    = $q.defer();
        $http({
            method:'GET',
            url:'/tasks/taskexport'
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function exportData() {

       var deferred = $q.defer();
       $http({
           method: 'POST',
           url: '/tools/taskexport'
       }).success(function (data) {
           deferred.resolve(data);
       }).error(function (err) {
           deferred.reject(err);
       });
       return deferred.promise;
   };

    function getTasksList(status,limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
       data.status=status;
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/tasks/list',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    }

    function getTasks(id){
		var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/tasks/edit',
			data:data
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function save(data){
        var deferred    = $q.defer();
		$http({
            method:'POST',
            url: '/tasks/save',
            data: data,
        }).then(function(data){
            deferred.resolve(data);
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getTransaction(id){
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/tasks/getTransaction',
            data:{id:id}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/general'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getDeletedTasksList(status,limit,skip,sort,search){
      var deferred = $q.defer();
      var data = {};
       data.status=status;
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/tasks/deletedList',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    }


}
