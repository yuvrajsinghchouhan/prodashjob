angular.module('quickRabbit.contactus').controller('editContactCtrl', editContactCtrl);

editContactCtrl.$inject = ['contactEditReslove', 'ContactService', 'toastr', '$state', '$filter'];

function editContactCtrl(contactEditReslove, ContactService, toastr, $state, $filter) {
    var edcc = this;
    edcc.editContactData = contactEditReslove[0];

  edcc.Sendmail = function Sendmail(data) {
  if(data){
      ContactService.sendMail(edcc.editContactData).then(function (response) {
        if(response)
         {
            toastr.success('Mail Sended Successfully');
            $state.go('app.contact.view');
        }
  })
}}
    /*
    edcc.submit = function submit(isValid) {
        if (isValid) {
            ContactService.save(edcc.editContactData).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Contact Not Added Successfully');
                } else if (response.data == "wrong") {
                    toastr.error('Your Credentials are gone please login again.....');
                }
                else {
                    toastr.success('Contact Added Successfully');
                    $state.go('app.contact.view');
                }
            }, function (err) {
                for (var i = 0; i < err.length; i++) {
                    toastr.error('Your credentials are gone' + err[i].msg + '--' + err[i].param);
                }
            });
        } else {
            toastr.error('form is invalid');
        }

    };
    */

}
