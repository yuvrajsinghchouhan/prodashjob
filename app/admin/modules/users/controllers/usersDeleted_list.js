angular.module('quickRabbit.users').controller('trashUserListCtrl', trashUserListCtrl);

trashUserListCtrl.$inject = ['trashUserServiceResolve','$scope','UsersService'];

function trashUserListCtrl(trashUserServiceResolve,$scope,UsersService) {

      var tulc = this;
      tulc.permission = $scope.privileges.filter(function (menu) {
          return (menu.alias === "users");
      }).map(function (menu) {
          return menu.status;
      })[0];
      console.log("data",trashUserServiceResolve[0]);
      console.log("data",trashUserServiceResolve[1]);


       /*if (trashUserServiceResolve) {
          tulc.allValue = trashUserServiceResolve[2].allValue || 0;
          tulc.activeValue = trashUserServiceResolve[2].activeValue || 0;
          tulc.deactivateValue = trashUserServiceResolve[2].deactivateValue || 0;
        }
*/

      var layout = [
          {
              name: 'Username',
              template: '{{content.username}}',
              sort: 1,
              variable: 'username',
          },
          {
              name: 'Email',
              template: '{{content.email}}',
              sort: 1,
              variable: 'email',
          },
          {
              name: 'Status ',
              template:
              '<span  ng-switch="content.status">' +
              '<span  ng-switch-when="0">Deleted</span>' +
              '</span>'
          },
          {
              name: 'Deleted Date',
              template: '{{content.updatedAt | clock : options.date}}',
              sort: 1,
              variable: 'updatedAt'
          },
          {
              name: 'Actions',
              template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b"  ng-if="options.permission.edit != false"  ui-sref="app.users.add({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' /* +
              '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false"  
ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>' */
          }
      ];
      tulc.table = {};
      tulc.table.layout = layout;
      tulc.table.data = trashUserServiceResolve[0];
      tulc.table.count = trashUserServiceResolve[1] || 0;
      tulc.table.delete = {
          'permission': tulc.permission,
          'date': $scope.date,
          service: '/users/getdeletedusers33', getData: function (currentPage, itemsPerPage, sort, status, search) {
              if (currentPage >= 1) {
                  var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                  UsersService.deleteuserList($scope.statusValue,itemsPerPage, skip, sort, status, search).then(function (respo) {
                      tulc.table.data = respo[0];
                      tulc.table.count = respo[1];

                  });
              }
          }
      };

}
