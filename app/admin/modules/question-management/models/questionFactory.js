var app = angular.module('quickRabbit.question');

app.factory('QuestionService',QuestionService);

QuestionService.$inject = ['$http','$q', 'Upload'];

function QuestionService($http, $q, Upload){


    var QuestionService = {
        getQuestionList:getQuestionList,
        getQuestion:getQuestion,
        save:save
    };

    return QuestionService;

    function getQuestionList(limit,skip,sort,search){

      var deferred = $q.defer();
      var data = {};
      data.sort = sort;
      data.search = search;
      data.limit = limit;
      data.skip = skip;

      $http({
          method: 'POST',
          url: '/question/list',
          data: data
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;

    }
    function getQuestion(id){
		var data={id:id};
        var deferred    = $q.defer();
        $http({
            method:'POST',
            url:'/question/edit',
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
            url: '/question/save',
            data: data,
        }).then(function(data){
            deferred.resolve(data);
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
