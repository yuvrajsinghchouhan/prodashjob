angular.module('Authentication')
    .controller('registerCtrl', registerCtrl)
    .controller('LogoutController', LogoutController)
    .controller('userloginCtrl', userloginCtrl)
    .controller('registerTaskerCtrl', registerTaskerCtrl)
    .controller('taskerloginCtrl', taskerloginCtrl);

registerTaskerCtrl.$inject = ['$scope', '$rootScope', '$location', 'AuthenticationService', '$state', 'toastr', '$cookieStore', 'socket', '$translate'];
function registerTaskerCtrl($scope, $rootScope, $location, AuthenticationService, $state, toastr, $cookieStore, socket, $translate) {
    var rttc = this;
    rttc.SubmitTasker = function (valid) {
        if (valid) {
            $cookieStore.put('TaskerData', rttc.UserDetails);
            $state.go('registertasker.' + rttc.UserDetails.next, {}, { reload: false });
        } else {
            $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
    };
}

taskerloginCtrl.$inject = ['$scope', '$rootScope', '$location', 'AuthenticationService', '$state', 'toastr', '$cookieStore', 'socket', '$translate'];
function taskerloginCtrl($scope, $rootScope, $location, AuthenticationService, $state, toastr, $cookieStore, socket, $translate) {
    AuthenticationService.ClearCredentials();
    $scope.login = function () {
        AuthenticationService.taskerLogin($scope.username, $scope.password, function (response) {
            if ($scope.username && (response.user == $scope.username || response.email == $scope.username)) {
                AuthenticationService.SetCredentials(response.user, response.user_id, response.token, response.user_type, response.tasker_status);
                $cookieStore.remove('TaskerData');
                $rootScope.$emit('notification', { user: response.user_id, type: response.user_type });
                $rootScope.$emit('webNotification', { user: response.user_id, type: response.user_type });
                $state.go('account', {}, { reload: true });
            } else {
                $scope.error = response.message || "INVALIDUSERNAME_PASSWORD";
            }
        }, function (err) {
            $scope.error = err;
        });
    };
}

userloginCtrl.$inject = ['$scope', '$http', '$rootScope', '$location', 'AuthenticationService', '$state', 'toastr', '$cookieStore', 'socket', 'PreviousState', '$window', '$translate'];
function userloginCtrl($scope, $http, $rootScope, $location, AuthenticationService, $state, toastr, $cookieStore, socket, PreviousState, $window, $translate) {
    AuthenticationService.ClearCredentials();
    $scope.login = function () {
        AuthenticationService.userLogin($scope.username, $scope.password, function (response) {
            if ($scope.username && (response.user == $scope.username || response.email == $scope.username)) {
                AuthenticationService.SetCredentials(response.user, response.user_id, response.token, response.user_type, response.tasker_status);
                $cookieStore.remove('TaskerData');
                $rootScope.$emit('notification', { user: response.user_id, type: response.user_type });
                $rootScope.$emit('webNotification', { user: response.user_id, type: response.user_type });
                $state.go('landing', {}, { reload: true });
            } else {
                $scope.error = response || "INVALIDUSERNAME_PASSWORD";
            }
        });
    };


    $scope.facebookLogin = function () {
        var url = '/auth/facebook',
            width = 1000,
            height = 650,
            top = (window.outerHeight - height) / 2,
            left = (window.outerWidth - width) / 2;
        $window.open(url, 'facebook_login', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
    }

    $window.app = {
        authState: function (data) {
            var username = data.username;
            username = username.replace(/^"(.*)"$/, '$1');
            var _id = data._id;
            _id = _id.replace(/^"(.*)"$/, '$1');
            var role = data.role;
            role = role.replace(/^"(.*)"$/, '$1');
            var token = data.token;
            token = token.replace(/^"(.*)"$/, '$1');

            AuthenticationService.SetCredentials(username, _id, token, "user", 1)
            $rootScope.$emit('notification', { user: _id, type: "user" });
            $rootScope.$emit('webNotification', { user: _id, type: "user" });
            $state.go('landing', {}, { reload: true });
        },
        failauthState: function (data) {
            var err = data.err.error[0];
            var str = err.match(/\$(.*)/);
            var currenterr = str[0].substring(1, 5);
            if (user = currenterr) {
                $translate('Username already exist').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            }
            $state.go('landing', {}, { reload: true });
        }
    };
    //-------------------------------------------------------------------------------
    $scope.user = {};
    // Defining user logged status
    $scope.logged = false;
    // And some fancy flags to display messages upon user status change
    $scope.byebye = false;
    $scope.salutation = false;
}

registerCtrl.$inject = ['$scope', '$rootScope', '$location', 'AuthenticationService', '$state', '$filter', 'toastr', '$cookieStore', '$stateParams', '$translate'];
function registerCtrl($scope, $rootScope, $location, AuthenticationService, $state, $filter, toastr, $cookieStore, $stateParams, $translate) {
    var rgc = this;
    rgc.UserDetails = {};
    $scope.location = {};
    rgc.UserDetails.address = {};
    rgc.type = $stateParams.type;
    rgc.placeChanged = function () {
        rgc.place = this.getPlace();
        $scope.location.lng = rgc.place.geometry.location.lng();
        $scope.location.lat = rgc.place.geometry.location.lat();
        rgc.UserDetails.location = $scope.location;
        rgc.UserDetails.address.line1 = rgc.place.formatted_address;
        var locationa = rgc.place;
        rgc.UserDetails.address.line1 = '';
        rgc.UserDetails.address.line2 = '';

        if (locationa.name) {
            rgc.UserDetails.address.line1 = locationa.name;
        }

        for (var i = 0; i < locationa.address_components.length; i++) {
            for (var j = 0; j < locationa.address_components[i].types.length; j++) {
                if (locationa.address_components[i].types[j] == 'neighborhood') {
                    if (rgc.UserDetails.address.line1 != locationa.address_components[i].long_name) {
                        if (rgc.UserDetails.address.line1 != '') {
                            rgc.UserDetails.address.line1 = rgc.UserDetails.address.line1 + ',' + locationa.address_components[i].long_name;
                        } else {
                            rgc.UserDetails.address.line1 = locationa.address_components[i].long_name;
                        }
                    }
                }
                if (locationa.address_components[i].types[j] == 'route') {
                    if (rgc.UserDetails.address.line1 != locationa.address_components[i].long_name) {
                        if (rgc.UserDetails.address.line2 != '') {
                            rgc.UserDetails.address.line2 = rgc.UserDetails.address.line2 + ',' + locationa.address_components[i].long_name;
                        } else {
                            rgc.UserDetails.address.line2 = locationa.address_components[i].long_name;
                        }
                    }

                }
                if (locationa.address_components[i].types[j] == 'street_number') {
                    if (rgc.UserDetails.address.line2 != '') {
                        rgc.UserDetails.address.line2 = rgc.UserDetails.address.line2 + ',' + locationa.address_components[i].long_name;
                    } else {
                        rgc.UserDetails.address.line2 = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
                    if (rgc.UserDetails.address.line2 != '') {
                        rgc.UserDetails.address.line2 = rgc.UserDetails.address.line2 + ',' + locationa.address_components[i].long_name;
                    } else {
                        rgc.UserDetails.address.line2 = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'locality') {

                    rgc.UserDetails.address.city = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'country') {

                    rgc.UserDetails.address.country = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'postal_code') {

                    rgc.UserDetails.address.zipcode = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'administrative_area_level_1' || locationa.address_components[i].types[j] == 'administrative_area_level_2') {
                    rgc.UserDetails.address.state = locationa.address_components[i].long_name;
                }
            }
        }


        /*   for (var i = 0; i < locationa.address_components.length; i++) {

               for (var j = 0; j < locationa.address_components[i].types.length; j++) {
                   if (locationa.address_components[i].types[j] == 'sublocality_level_1' || locationa.address_components[i].types[j] == 'sublocality_level_2') {
                       rgc.UserDetails.address.line1 = locationa.address_components[i].long_name;
                   }
                   if (locationa.address_components[i].types[j] == 'route' || locationa.address_components[i].types[j] == 'street_number') {
                       rgc.UserDetails.address.line2 = locationa.address_components[i].long_name;
                   }
                   if (locationa.address_components[i].types[j] == 'locality') {
                       rgc.UserDetails.address.city = locationa.address_components[i].long_name;
                   }
                   if (locationa.address_components[i].types[j] == "administrative_area_level_1") {
                       rgc.UserDetails.address.state = locationa.address_components[i].long_name;
                   }
                   if (locationa.address_components[i].types[j] == "country") {
                       rgc.UserDetails.address.country = locationa.address_components[i].long_name;
                   }
                   if (locationa.address_components[i].types[j] == "postal_code") {
                       rgc.UserDetails.address.zipcode = locationa.address_components[i].long_name;
                   }
               }
       }*/
    };

    rgc.registerUser = function (isValid, formData) {
        rgc.Error = '';
        var today = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        if (isValid) {
            rgc.UserDetails.today = today;
            rgc.UserDetails.role = rgc.type;
            rgc.UserDetails.location = $scope.location;
            AuthenticationService.Register(rgc.UserDetails, function (err, response) {
			           console.log("response",response)
                if (err) {
                    $translate('EMAIL ID OR USER NAME ALREADY EXISTS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                } else {
                    if (response.user == rgc.UserDetails.username) {
                      console.log(">>>",response.verification_code);
                      console.log("<<<",response.verification_code.length );
                      if(response.verification_code.length == 0 ){
                        $state.go('landing', {}, { reload: true });
                        $translate('REGISTER SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
                      }else{
                        $state.go('signupotp', { 'id': response.user_id }, { reload: false });
                      }
                    } else {
                        $translate('EMAIL ID OR USER NAME ALREADY EXISTS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                    }
                }
            });
        } else {
            $translate('PLEASE FILL ALL MANDATORY FIELDS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
    };

    rgc.change = function (referalcode) {
        if (referalcode) {
            AuthenticationService.checkreferal(referalcode).then(function (err, data) {
                if (err.message == 'Invalid referal code') {
                    rgc.UserDetails.referalcode = "";
                    $translate('INVALID REFERAL CODE').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                } else if (err.message == 'Success') {
                    $translate('VALID REFERAL CODE').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
                }
            });
        }
    }

    rgc.emailchange = function (email) {
        AuthenticationService.checkemail(email).then(function (err, data) {
            if (err.message == 'Email Exist') {
                rgc.UserDetails.email = "";
                $translate('SORRY EMAIL ID ALREADY EXIST').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            } else if (err.message == 'Email not exist') {
                $translate('VALID EMAIL ID').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            }
        });
    }
};

LogoutController.$inject = ['$scope', '$rootScope', '$location', 'AuthenticationService', '$state', '$filter', 'toastr', '$cookieStore'];
function LogoutController($scope, $rootScope, $location, AuthenticationService, $state, $filter, toastr, $cookieStore) {
    var user = AuthenticationService.GetCredentials();
    AuthenticationService.Logout(user).then(function (data) {
        AuthenticationService.ClearCredentials();
        $state.go('landing', {}, { reload: true });
    });
};
