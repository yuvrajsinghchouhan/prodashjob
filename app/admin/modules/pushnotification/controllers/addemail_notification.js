angular.module('quickRabbit.pushnotification').controller('NotificationemailCtrl', NotificationemailCtrl);

NotificationemailCtrl.$inject = ['emailEditReslove', 'toastr', 'emailService', '$state', '$stateParams'];

function NotificationemailCtrl(emailEditReslove, toastr, emailService, $state, $stateParams) {
    var nelc = this;
    nelc.templateData = emailEditReslove[0];

    if ($stateParams.id) {
        nelc.action = 'edit';
        nelc.breadcrumb = 'SubMenu.EMAILTEMPLATE_EDIT';
    } else {
        nelc.action = 'add';
        nelc.breadcrumb = 'SubMenu.EMAILTEMPLATE_ADD';
    }

    nelc.submitTemplateEditData = function submitTemplateEditData(isValid, data) {
        if (isValid) {
            emailService.editnotificationTemplate(data).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Notification Not Added Successfully');
                } else {
                    toastr.success('Notification Updated Successfully');
                    $state.go('app.pushnotifications.templates');
                }
            }, function (err) {
                toastr.error('Your credentials are gone' + err[0].msg);
            });
        }
        else {
            toastr.error('Please fill all mandatory fields');
        }
    };

    /*
    nelc.onchangenotification = function (notificationtype) {
        // console.log('notificationtype',notificationtype);
    };
    */

}
