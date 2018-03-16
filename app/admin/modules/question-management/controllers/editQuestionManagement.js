angular.module('quickRabbit.question').controller('editQuestionerCtrl',editQuestionerCtrl);

editQuestionerCtrl.$inject = ['QuestionEditReslove','QuestionService','toastr','$state','$stateParams'];

function editQuestionerCtrl(QuestionEditReslove,QuestionService,toastr,$state,$stateParams){
    var edqc = this;
        edqc.editQuestionData  = QuestionEditReslove[0];

        if ($stateParams.id) {
            edqc.action = 'edit';
            edqc.breadcrumb = 'SubMenu.EDIT_QUESTION';
        } else {
            edqc.action = 'add';
            edqc.breadcrumb = 'SubMenu.ADD_QUESTION';
        }

    edqc.submit = function submit(isValid){
        if(isValid) {
            QuestionService.save(edqc.editQuestionData).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Question Not Added Successfully');
                } else   if(response.data == "wrong"){
                    toastr.error('Your Credentials are gone please login again.....');
                }
                else {
                    toastr.success('Question Added Successfully');
                    $state.go('app.tasker_management.question.viewsQuestion');
                }
            }, function (err) {
                /*toastr.error('Your credentials are gone', 'Error');*/
                for(var i=0;i<err.length;i++){
                    toastr.error('Your credentials are gone'+err[i].msg+'--'+err[i].param);
                }
            });
        }else{
            toastr.error('form is invalid');
        }

    };



}
