angular.module('quickRabbit.pages').controller('editPageLanguageCtrl', editPageLanguageCtrl);

editPageLanguageCtrl.$inject = ['SubPageServiceResolve','PageTranslateServiceResolve', 'toastr', 'PageService', 'Slug', '$state', '$stateParams'];

function editPageLanguageCtrl(SubPageServiceResolve,PageTranslateServiceResolve, toastr, PageService, Slug, $state, $stateParams) {

    var edplc = this;
    edplc.mainPagesList = SubPageServiceResolve[0];
    //consol.log('fsa');
    //console.log("SubPageServiceResolve",SubPageServiceResolve);
    edplc.editPageData = {};

    if ($stateParams.id) {
        edplc.action = 'edit';
        edplc.breadcrumb = 'SubMenu.EDIT_PAGE';
    } else {
        edplc.action = 'add';
        edplc.breadcrumb = 'SubMenu.ADD_PAGE';
    }

    edplc.languagedata = PageTranslateServiceResolve.languagedata;
    edplc.pageCollectionData = PageTranslateServiceResolve.pagesdata;
     PageService.getSetting().then(function (response) {
        edplc.editsettingData = response[0].settings.site_url;
    })

    edplc.editPageData = SubPageServiceResolve[1][0];
    edplc.submitEditPageData = function submitEditPageData(isValid, data) {
               if (isValid) {
            data.slug = Slug.slugify(data.slug);

            PageService.submitPage(data).then(function (response) {
                console.log("response",response);
                if(response == "Assigned"){
                     toastr.error('This Page already assigned to this language check again!!!');
                }
                else if (response.code == 11000) {
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