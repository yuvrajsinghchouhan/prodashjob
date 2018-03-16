angular.module('quickRabbit.experience').controller('editExperienceCtrl',editExperienceCtrl);

editExperienceCtrl.$inject = ['ExperienceService','toastr','ExperienceEditReslove','$state','$stateParams'];
function editExperienceCtrl(ExperienceService, toastr,ExperienceEditReslove,$state,$stateParams){
    var eec = this;
    eec.editExperienceData = ExperienceEditReslove;
  /*,ExperienceEditReslove*/
  if ($stateParams.id) {
      eec.action = 'edit';
      eec.breadcrumb = 'SubMenu.EDIT_EXPERIENCE';
  } else {
      eec.action = 'add';
      eec.breadcrumb = 'SubMenu.ADD_EXPERIENCE';
  }
  eec.submit = function submit(isValid) {
  if(isValid) {
      ExperienceService.save(eec.editExperienceData).then(function (response) {
          if (response.code == 11000) {
              toastr.error('Experience Not Added Successfully');
          } else   if(response.data == "wrong"){
              toastr.error('Your Credentials are gone please login again.....');
          }
          else {
            if(eec.action == 'edit') {
                var action = "edited";
            } else {
                var action = "added";
            }
            toastr.success('Experience ' + action + ' Successfully');
            $state.go('app.tasker_management.experience.list');
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
