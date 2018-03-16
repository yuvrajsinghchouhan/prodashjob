angular.module('Authentication')
    .controller('LoginController', ['$scope', '$state', 'AuthenticationService', 'MainService', function ($scope, $state, AuthenticationService, MainService) {
        $scope.remember = false;
        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.user == $scope.username) {
                    AuthenticationService.SetCredentials(response.user, $scope.password, response.token);
                    $state.go("app.dashboard");
                } else {
                    $scope.error = response[response.length - 1];
                    $scope.dataLoading = false;
                }
            });
        };
    }])

    .controller('LogoutController', ['AuthenticationService', '$state', function (AuthenticationService, $state) {
        AuthenticationService.ClearCredentials();
        AuthenticationService.Logout().then(function (data) {
            if (data.retStatus == 'Success') {
                $state.go("login");
            } else {
                $state.go("app.dashboard");
            }
        });
    }]);