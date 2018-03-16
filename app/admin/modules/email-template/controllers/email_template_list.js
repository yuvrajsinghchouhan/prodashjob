angular.module('quickRabbit.emailTemplate').controller('emailTemplateListCtrl', emailTemplateListCtrl);
emailTemplateListCtrl.$inject = ['emailTemplateListResolve', 'EmailTemplateService', '$modal', '$scope'];

function emailTemplateListCtrl(emailTemplateListResolve, EmailTemplateService, $modal, $scope) {
    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "etemplate");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: 'Template Name',
            variable: 'name',
            template: '{{content.name}}',
            sort: 1
        },
        {
            name: 'Email Subject',
            template: '{{content.email_subject}}'
        },
        {
            name: 'Sender Email ',
            template: '{{content.sender_email}}'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.emailtemplate.action({action:"edit",id:content._id})><i class="fa fa-edit"></i> <span>Edit</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'

        }
    ];

    //var etl = this;
    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = emailTemplateListResolve[0];
    tlc.table.count = emailTemplateListResolve[1] || 0;
    tlc.table.delete = {
        'permission': tlc.permission, service: '/email-template/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                EmailTemplateService.getTemplateList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                    tlc.table.data = respo[0];
                    tlc.table.count = respo[1];
                });
            }
        }
    };

}
