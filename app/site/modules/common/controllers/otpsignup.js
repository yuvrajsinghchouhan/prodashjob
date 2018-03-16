angular.module('quickRabbit.forgotpassword').controller('otploginCtrl', otploginCtrl);
otploginCtrl.$inject = ['$scope', '$state', 'ForgotpwduserService', 'toastr', '$translate', '$stateParams', 'AuthenticationService', '$cookieStore', '$location'];
function otploginCtrl($scope, $state, ForgotpwduserService, toastr, $translate, $stateParams, AuthenticationService, $cookieStore, $location) {
    var otpc = this;

    otpc.newstatus=false;

    ForgotpwduserService.getuserdata($stateParams.id).then(function (response) {
          otpc.user = response;
          console.log(response);
      })

      otpc.activate = function activate(isValid, formData) {
        console.log("formData",formData)
          if (formData) {
              var data = {};
              data.mobile = formData;
              data.userid = $stateParams.id;
              ForgotpwduserService.activateUserAccount(data).then(function (response) {
              console.log("response",response);
              if (response) {
                otpc.newstatus=true;
              }
              }, function (err) {
                otpc.newstatus=true;
                  $translate(err.message).then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
              });
            }

      }


    otpc.otpsignup = function otpsignup(isValid, formData) {
      console.log("formData",formData)
        if (formData) {
            var data = {};
            data.otpKey = formData;
            data.userid = $stateParams.id;
            ForgotpwduserService.otpsave(data).then(function (response) {
                if (response) {
                    $translate('OTP VERIFIED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
                    $state.go('userlogin')
                  /*  AuthenticationService.SetCredentials(response.username, response._id, response.token, response.role, response.status);
                    $cookieStore.remove('TaskerData');
                    if (response.role == 'user') {
                        toastr.success('User Registered Successfully');
                        $location.path('/');
                        //  $state.go('landing')
                    } else {
                        $state.go('becometasker.step1', {}, { reload: false });
                    }*/
                } else {
                    $translate('INVALID OTP').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                }
            }, function (err) {
                $translate('INVALID EMAIL ID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            });
        } else {
           $translate('OTP IS REQUIRED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

        }
    }
    console.log($stateParams.id);

    otpc.resendotp = function resendotp(isValid, formData) {
        if ($stateParams.id) {
            ForgotpwduserService.resendotp($stateParams.id).then(function (response) {
              $translate('OTP RESEND SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            }, function (err) {
             $translate('INVALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                // toastr.error('User Not exist');
                });
        } else {
          $translate('OTP IS REQUIRED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

        }
    }

}
