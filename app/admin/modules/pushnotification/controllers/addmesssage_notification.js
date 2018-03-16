angular.module('quickRabbit.pushnotification').controller('NotificationmessageCtrl', NotificationmessageCtrl);

NotificationmessageCtrl.$inject = ['messageService', 'toastr', '$state', '$stateParams'];

function NotificationmessageCtrl(messageService, toastr, $state, $stateParams) {
  var nmlc = this;
  // nmlc.templateData  = emailEditReslove[0];
  if ($stateParams.id) {
    nmlc.action = 'edit';
    nmlc.breadcrumb = 'SubMenu.EMAILTEMPLATE_EDIT';
  } else {
    nmlc.action = 'add';
    nmlc.breadcrumb = 'SubMenu.EMAILTEMPLATE_ADD';
  }
  /*
  nmlc.submitTemplatdddeEditData = function submitTemplatddddeEditData(isValid, data) {
    console.log(data);
  };
  */
}
