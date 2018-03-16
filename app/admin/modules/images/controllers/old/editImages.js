angular.module('quickRabbit.images').controller('editImagesCtrl', editImagesCtrl);

editImagesCtrl.$inject = ['imagesEditReslove', 'ImagesService', 'toastr', '$state'];

function editImagesCtrl(imagesEditReslove, ImagesService, toastr, $state) {
    var edic = this;
    edic.editImagesData = imagesEditReslove[0];
    edic.id = $state.params.id;

    if (edic.id) {
        edic.role = 'Edit';
    }
    else {
        edic.role = 'New';
    }


    edic.submit = function submit(isValid) {
        if (isValid) {
            ImagesService.save(edic.editImagesData).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Appearance Settings Not Added Successfully');
                } else if (response.data == "wrong") {
                    toastr.error('Your Credentials are gone please login again.....');
                }
                else {
                    toastr.success('Appearance Settings Update Successfully');
                    $state.go('app.images.imagelist');
                }
            }, function (err) {
                toastr.error('Your credentials are gone' + err[0].msg + '--' + err[0].param);
            });
        } else {
            toastr.error('form is invalid');
        }
    };



}
