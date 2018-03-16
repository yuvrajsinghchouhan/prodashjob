angular.module('quickRabbit.pushnotification').controller('UserListCtrl', UserListCtrl);
UserListCtrl.$inject = ['UsernotificationServiceResolve', 'UsernotificationService', 'emailEditReslove', 'emailService', 'messageEditReslove', '$window', '$modal', '$scope'];

function UserListCtrl(UsernotificationServiceResolve, UsernotificationService, emailEditReslove, emailService, messageEditReslove, $window, $modal, $scope) {

    var ulc = this;
    ulc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "notification");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'User',
            variable: 'email',
            template: '{{content.email}}',
            sort: 1
        }
    ];


    var ulc = this;
    ulc.table = {};
    ulc.table.layout = layout;
    ulc.table.module = 'earnings';
    ulc.table.maildata = emailEditReslove[0];
    ulc.table.messagedata = messageEditReslove[0];
    ulc.table.data = UsernotificationServiceResolve[0];
    ulc.table.count = UsernotificationServiceResolve[1] || 0;
    ulc.table.delete = {
        'permission': ulc.permission, service: '/newsletter/subscriber/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            UsernotificationService.getUserList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                ulc.table.data = respo[0];
                ulc.table.count = respo[1];
            });
        }
    };


}
