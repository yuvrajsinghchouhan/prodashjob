angular.module('quickRabbit.categories').controller('editCategoryCtrl', editCategoryCtrl);

editCategoryCtrl.$inject = ['categoryEditReslove', 'CategoryService', 'toastr', '$state', '$stateParams', 'Slug'];

function editCategoryCtrl(categoryEditReslove, CategoryService, toastr, $state, $stateParams, Slug) {
    var ecatc = this;

    ecatc.mainPagesList = categoryEditReslove[0];
    ecatc.editCategoryData = {};
    ecatc.editCategoryData = categoryEditReslove[1];

    if ($stateParams.id) {
        ecatc.action = 'edit';
        ecatc.breadcrumb = 'SubMenu.EDIT_CATEGORY';
    } else {
        ecatc.action = 'add';
        ecatc.breadcrumb = 'SubMenu.ADD_CATEGORY';
    }

    CategoryService.getSetting().then(function (response) {
        ecatc.editsettingData = response[0].settings.site_url;
    })
    ecatc.disbledValue = false;
    ecatc.submit = function submit(isValid, data) {

        console.log('>>>>>>>>>>>>>>>>ctrler>>>>>>>>>>>>>>>')
        console.log(data)
        console.log('>>>>>>>>>>>>>>>>ctrler>>>>>>>>>>>>>>>')

        if (isValid) {
            ecatc.disbledValue = true;
            data.slug = Slug.slugify(data.slug);
            // toastr.success('form is valid');
            CategoryService.savecategory(data).then(function (response) {



                if (response.code == 11000) {
                    toastr.error('Category Not Added Successfully');
                } else if (response.data == "wrong") {
                    toastr.error('Your Credentials are gone please login again.....');
                }
                else {
                    toastr.success('Category Added Successfully');
                    $state.go('app.categories.list');
                }
            }, function (err) {
                // console.log('>>>>>>>>>>>>>>>>>>', err)
                toastr.error('Your credentials are gone');
            });
        } else {
            toastr.error('form is invalid');
        }

    };

}
