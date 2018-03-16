angular.module('quickRabbit.categories').controller('editsubCategoryCtrl', editsubCategoryCtrl);

editsubCategoryCtrl.$inject = ['categoryEditReslove', 'CategoryService', 'toastr', '$state', '$stateParams', '$location', 'Slug'];

function editsubCategoryCtrl(categoryEditReslove, CategoryService, toastr, $state, $stateParams, $location, Slug) {
    var escatc = this;

    escatc.mainPagesList = categoryEditReslove[0];
    escatc.editCategoryData = {};
    escatc.editCategoryData = categoryEditReslove[1];
    CategoryService.getSetting().then(function (response) {
        escatc.editsettingData = response[0].settings.site_url;
    })

    if ($stateParams.id) {
        escatc.action = 'edit';
        escatc.breadcrumb = 'SubMenu.EDIT_SUBCATEGORY';
    } else {
        escatc.action = 'add';
        escatc.breadcrumb = 'SubMenu.ADD_SUBCATEGORY';
    }
    escatc.disbledValue = false;
    escatc.submit = function submit(isValid, data) {
        if (isValid) {
            escatc.disbledValue = true;
            data.slug = Slug.slugify(data.slug);
            // toastr.success('form is valid');
            CategoryService.savesubcategory(data).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Category Not Added Successfully');
                } else if (response.data == "wrong") {
                    toastr.error('Your Credentials are gone please login again.....');
                }
                else {
                    toastr.success('Category Added Successfully');
                    $state.go('app.categories.subcategorylist');
                }
            }, function (err) {
                toastr.error('Your credentials are gone');
            });
        } else {
            toastr.error('form is invalid');
        }

    };

}
