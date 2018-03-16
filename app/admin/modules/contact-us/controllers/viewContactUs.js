angular.module('quickRabbit.contactus').controller('viewContactCtrl', viewContactCtrl);

viewContactCtrl.$inject = ['ContactServiceResolve', 'ContactService', '$scope'];

function viewContactCtrl(ContactServiceResolve, ContactService, $scope) {

    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "contact");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'Name',
            variable: 'name',
            template: '{{content.name}}',
            sort: 1
        },
        {
            name: 'Email',
            template: '{{content.email}}'
        }, {
            name: 'Mobile',
            template: '{{content.mobile}}'
        }, {
            name: 'Subject',
            template: '{{content.subject}}'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.contact.add({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>View</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
            //template:'<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ui-sref=app.contact.add({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>View</span></button>'
        }
    ];
    //var vsc = this;
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = ContactServiceResolve[0];
    tlc.table.count = ContactServiceResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission, 'date': $scope.date, service: '/contact/deletecontact', 'getData': function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            ContactService.getContactList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1];
            });
        }
    };

}
