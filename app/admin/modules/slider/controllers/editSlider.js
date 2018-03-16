angular.module('quickRabbit.sliders').controller('editSliderCtrl', editSliderCtrl);

editSliderCtrl.$inject = ['sliderEditReslove', 'SliderService', 'toastr', '$state', '$stateParams'];

function editSliderCtrl(sliderEditReslove, SliderService, toastr, $state, $stateParams) {
    var edsc = this;
    edsc.editSliderData = sliderEditReslove[0];

    edsc.requiredValue = true;
    if ($stateParams.id) {
        edsc.action = 'edit';
        edsc.breadcrumb = 'SubMenu.EDIT_SLIDER';
        edsc.requiredValue = false;
    } else {
        edsc.action = 'add';
        edsc.requiredValue = true;
        edsc.breadcrumb = 'SubMenu.ADD_SLIDER';
    }

    SliderService.getSliderList().then(function (respo) {

        edsc.sliderListCount = respo[1];

        if ($stateParams.id) {
            edsc.submit = function submit(isValid) {
                if (isValid) {
                    SliderService.save(edsc.editSliderData).then(function (response) {
                        if (response.code == 11000) {
                            toastr.error('Slider Not Added Successfully');
                        } else if (response.data == "wrong") {
                            toastr.error('Your Credentials are gone please login again.....');
                        }
                        else {
                            toastr.success('Slider Added Successfully');
                            $state.go('app.sliders.viewsSlider');
                        }
                    }, function (err) {
                        /*toastr.error('Your credentials are gone', 'Error');*/
                        for (var i = 0; i < err.length; i++) {
                            toastr.error('Your credentials are gone' + err[i].msg + '--' + err[i].param);
                        }
                    });
                } else {
                    toastr.error('form is invalid');
                }

            };
        } else {
            edsc.submit = function submit(isValid) {
                if (isValid) {
                    SliderService.save(edsc.editSliderData).then(function (response) {

                        if (response.code == 11000) {
                            toastr.error('Slider Not Added Successfully');
                        } else if (response.data == "wrong") {
                            toastr.error('Your Credentials are gone please login again.....');
                        }
                        else {
                            toastr.success('Slider Added Successfully');
                            $state.go('app.sliders.viewsSlider');
                        }
                    }, function (err) {
                        toastr.error('Your credentials are gone');
                        for (var i = 0; i < err.length; i++) {
                            toastr.error('Your credentials are gone' + err[i].msg + '--' + err[i].param);
                        }
                    });
                } else {
                    toastr.error('form is invalid');
                }

            };
        }
    });
}
