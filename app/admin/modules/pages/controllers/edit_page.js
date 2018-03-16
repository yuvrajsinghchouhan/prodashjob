angular.module('quickRabbit.pages').controller('editPageCtrl', editPageCtrl);

editPageCtrl.$inject = ['PageServiceResolve', 'toastr', 'PageService', 'Slug', '$state', '$stateParams'];

function editPageCtrl(PageServiceResolve, toastr, PageService, Slug, $state, $stateParams) {

    var edpc = this;
    edpc.mainPagesList = PageServiceResolve[0];
    edpc.editPageData = {};

    if ($stateParams.id) {
        edpc.action = 'edit';
        edpc.breadcrumb = 'SubMenu.EDIT_PAGE';
    } else {
        edpc.action = 'add';
        edpc.breadcrumb = 'SubMenu.ADD_PAGE';
    }

    PageService.getSetting().then(function (response) {
        edpc.editsettingData = response[0].settings.site_url;
    })

    edpc.editPageData = PageServiceResolve[1][0];
    edpc.submitEditPageData = function submitEditPageData(isValid, data) {

        if (isValid) {
            data.slug = Slug.slugify(data.slug);

            PageService.submitPage(data).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Page Slug already exists');
                } else if (response.data == "wrong") {
                    toastr.error('Your Credentials are gone please login again.....');
                } else {
                    toastr.success(response.message);
                    $state.go('app.pages.list');
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

}
