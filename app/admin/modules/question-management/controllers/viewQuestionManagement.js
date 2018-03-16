angular.module('quickRabbit.sliders').controller('viewQuestionCtrl',viewQuestionCtrl);

viewQuestionCtrl.$inject = ['QuestionServiceResolve','QuestionService','$scope'];

function viewQuestionCtrl(QuestionServiceResolve,QuestionService,$scope){

  var tlc = this;
  tlc.permission =$scope.privileges.filter(function (menu) {
      return (menu.alias === "questionmanagement");
  }).map(function (menu) {
      return menu.status;
  })[0];


        var layout = [
        {
            name:'Question',
            variable:'question',
            template:'{{content.question}}',
            sort:1
        },
        {
            name:'Status ',
            template:'<span ng-switch="content.status">' +
                     '<span  ng-switch-when="1">Publish</span>' +
                     '<span  ng-switch-when="2">UnPublish</span>' +
                     '</span>'
        },
                {
            name: 'Actions',
             template:'<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.tasker_management.question.add({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
             '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'


        }
    ];
  //  var vsc = this;
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = QuestionServiceResolve[0];
    tlc.table.count = QuestionServiceResolve[1] || 0;
    tlc.table.delete = {'permission':tlc.permission,service:'/question/deletequestion', getData:function (currentPage, itemsPerPage, sort, status, search) {
        var skip = (parseInt(currentPage) - 1) * itemsPerPage;
        QuestionService.getQuestionList(itemsPerPage, skip, sort, status, search).then(function(respo) {
            tlc.table.data = respo[0];
            tlc.table.count = respo[1];
        });
    }};
}
