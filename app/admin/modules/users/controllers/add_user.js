angular.module('quickRabbit.users').controller('userAddCtrl', userAddCtrl);
userAddCtrl.$inject = ['usersEditServiceResolve', '$scope', 'toastr', 'UsersService', '$state', '$stateParams', '$modal', '$location'];

function userAddCtrl(usersEditServiceResolve, $scope, toastr, UsersService, $state, $stateParams, $modal, $location) {

    var usac = this;
    usac.editUserData = usersEditServiceResolve[0];

    if (usersEditServiceResolve[0])
        usac.addressList = usersEditServiceResolve[0].addressList;
    $scope.location = {};
    $scope.visibleValue = false;

    usac.checked = false;
    if ($stateParams.id) {
        usac.checked = true;
        usac.action = 'edit';
        usac.breadcrumb = 'SubMenu.EDIT_USER';
        usac.user_id = $stateParams.id;
    } else {
        usac.action = 'add';
        usac.breadcrumb = 'SubMenu.ADD_USER';
    }

    usac.addressStatus = function (id) {
        UsersService.addressStatus(id, usac.editUserData._id).then(function (response) {
            UsersService.UserAddress(usac.editUserData._id).then(function (refdata) {
                usac.addressList = refdata[0].addressList;
                toastr.success('Preferred Address Added Successfully');
            })
        });
    }

    usac.deleteAddress = function (id) {
        UsersService.deleteUserAddress(id, usac.editUserData._id).then(function (response) {
            UsersService.UserAddress(usac.editUserData._id).then(function (refdata) {
                usac.addressList = refdata[0].addressList;
            })
        });
    }


    usac.Editaddress = function (index) {

        if (index >= 0) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'app/admin/modules/users/views/addaddressmodel.html',
                controller: 'AddAddress',
                controllerAs: 'ATA',
                resolve: {
                    user: function () {
                        if (usac.addressList)
                            return usac.addressList[index];
                    }
                }
            });

            modalInstance.result.then(function (data) {
                UsersService.AddAddress(usac.editUserData._id, data).then(function (response) {
                    toastr.success('User Adddress Added Successfully');
                    UsersService.UserAddress(usac.editUserData._id).then(function (refdata) {
                        usac.addressList = refdata[0].addressList;
                    })
                });
            });

        }
        else {
            UsersService.UserAddress(usac.editUserData._id).then(function (datalen) {

                if (datalen[0].addressList.length < 5) {
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'app/admin/modules/users/views/addaddressmodel.html',
                        controller: 'AddAddress',
                        controllerAs: 'ATA',
                        resolve: {
                            user: function () {
                                if (usac.addressList)
                                    return usac.addressList[index];
                            }
                        }
                    });

                    modalInstance.result.then(function (data) {
                        UsersService.AddAddress(usac.editUserData._id, data).then(function (response) {
                            toastr.success('User Adddress Added Successfully');
                            UsersService.UserAddress(usac.editUserData._id).then(function (refdata) {
                                usac.addressList = refdata[0].addressList;
                            })
                        });
                    });
                }
                else {
                    toastr.error(' Added Only 5 Adddress ');
                }
            })
        }
    }


    usac.placeChanged = function () {
        // usac.editUserData.address.line1 = '';
        // usac.editUserData.address.line2 = '';
        usac.editUserData.address.line1 = '';
        usac.editUserData.address.line2 = '';
        usac.editUserData.address.country = '';
        usac.editUserData.address.zipcode = '';
        usac.editUserData.address.state = '';
        usac.place = this.getPlace();
        //usac.tasker.location = {};
        //usac.tasker.location.lng = antsc.place.geometry.location.lng();
        //usac.tasker.location.lat = antsc.place.geometry.location.lat();
        var locationa = usac.place;

        if (locationa.name) {
            usac.editUserData.address.line1 = locationa.name;
        }

        for (var i = 0; i < locationa.address_components.length; i++) {
            for (var j = 0; j < locationa.address_components[i].types.length; j++) {
                if (locationa.address_components[i].types[j] == 'neighborhood') {
                    if (usac.editUserData.address.line1 != locationa.address_components[i].long_name) {
                        if (usac.editUserData.address.line1 != '') {
                            usac.editUserData.address.line1 = usac.editUserData.address.line1 + ',' + locationa.address_components[i].long_name;
                        } else {
                            usac.editUserData.address.line1 = locationa.address_components[i].long_name;
                        }
                    }
                }
                if (locationa.address_components[i].types[j] == 'route') {
                    if (usac.editUserData.address.line1 != locationa.address_components[i].long_name) {
                        if (usac.editUserData.address.line2 != '') {
                            usac.editUserData.address.line2 = usac.editUserData.address.line2 + ',' + locationa.address_components[i].long_name;
                        } else {
                            usac.editUserData.address.line2 = locationa.address_components[i].long_name;
                        }
                    }

                }
                if (locationa.address_components[i].types[j] == 'street_number') {
                    if (usac.editUserData.address.line2 != '') {
                        usac.editUserData.address.line2 = usac.editUserData.address.line2 + ',' + locationa.address_components[i].long_name;
                    } else {
                        usac.editUserData.address.line2 = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
                    if (usac.editUserData.address.line2 != '') {
                        usac.editUserData.address.line2 = usac.editUserData.address.line2 + ',' + locationa.address_components[i].long_name;
                    } else {
                        usac.editUserData.address.line2 = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'locality') {

                    usac.editUserData.address.city = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'country') {

                    usac.editUserData.address.country = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'postal_code') {

                    usac.editUserData.address.zipcode = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'administrative_area_level_1' || locationa.address_components[i].types[j] == 'administrative_area_level_2') {
                    usac.editUserData.address.state = locationa.address_components[i].long_name;
                }
            }
        }
    };


    usac.submitUserEditData = function submitUserEditData(isValid, data) {
        if (isValid) {
            data.role = "user";
            data.loacation = $scope.location;
            if (isValid) {
                // Croping
                if ($scope.visibleValue == true) {
                    /*
                    function dataURItoBlob(dataURI, multipartFile) {
                        // convert base64/URLEncoded data component to raw binary data held in a string
                        var byteString;
                        if (dataURI.split(',')[0].indexOf('base64') >= 0)
                            byteString = atob(dataURI.split(',')[1]);
                        else
                            byteString = unescape(dataURI.split(',')[1]);

                        // separate out the mime component
                        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                        // write the bytes of the string to a typed array
                        var ia = new Uint8Array(byteString.length);
                        for (var i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }

                        var blob = new Blob([ia], { type: mimeString });
                        var fileName = multipartFile.name;
                        var multipart = new File([blob], fileName, { type: mimeString })

                        console.log(blob);
                        console.log(multipart);
                        return multipart;

                    }
                    */
                    //usac.editUserData.avatar = dataURItoBlob(usac.myCroppedImage, usac.editUserData.avatar);
                    usac.editUserData.avatarBase64 = usac.myCroppedImage;
                }
                // End Croping

                UsersService.editUserCall(usac.editUserData).then(function (response) {
				console.log("response",response)
                    if (response.data.code == 11000) {
                        toastr.error('Username or Email already exists');
                    } 
					if(response.data.nModified){
					toastr.success('User Updated Successfully');
					}
					else {
                        toastr.success('User Added Successfully');
                        $state.go('app.users.list');
                    }
                }, function (err) {
                    for (var i = 0; i < err.data.length; i++) {
                        toastr.error('Server Down');
                    }
                });

            } else {
                toastr.error('Form is Invalid');
            }
        } else {
            toastr.error('Form is Invalid');

        }
    }

    if ($stateParams.id) {
        UsersService.walletAmount(usac.editUserData._id).then(function (respo) {
            usac.wallet = respo[0];

        });
    }


    // Croping
    $scope.myImage = '';
    usac.myCroppedImage = '';
    //$scope.cropType = 'circle'; // circle & square
    $scope.handleFileSelect = function (evt) {
        $scope.visibleValue = true;
        var file = evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    // End Croping
}

angular.module('quickRabbit.taskers').controller('AddAddress', function ($modalInstance, toastr, user, $location, $state, $scope) {
    var ata = this;

    ata.editaddressdata = user;
    $scope.location = {};
    ata.addressList = {};
    ata.addressList.location = { lat: '', lng: '' };
    ata.placeChanged = function () {
        ata.place = this.getPlace();
        ata.addressList.location.lat = ata.place.geometry.location.lat();
        ata.addressList.location.lng = ata.place.geometry.location.lng();
        ata.availability = 2;
        var locationa = ata.place;

        ata.editaddressdata.line1 = '';
        ata.editaddressdata.street = '';

        if (locationa.name) {
            ata.editaddressdata.line1 = locationa.name;
        }

        for (var i = 0; i < locationa.address_components.length; i++) {
            for (var j = 0; j < locationa.address_components[i].types.length; j++) {
                if (locationa.address_components[i].types[j] == 'neighborhood') {
                    if (ata.editaddressdata.line1 != locationa.address_components[i].long_name) {
                        if (ata.editaddressdata.line1 != '') {
                            ata.editaddressdata.line1 = ata.editaddressdata.line1 + ',' + locationa.address_components[i].long_name;
                        } else {
                            ata.editaddressdata.line1 = locationa.address_components[i].long_name;
                        }
                    }
                }
                if (locationa.address_components[i].types[j] == 'route') {
                    if (ata.editaddressdata.line1 != locationa.address_components[i].long_name) {
                        if (ata.editaddressdata.street != '') {
                            ata.editaddressdata.street = ata.editaddressdata.street + ',' + locationa.address_components[i].long_name;
                        } else {
                            ata.editaddressdata.street = locationa.address_components[i].long_name;
                        }
                    }

                }
                if (locationa.address_components[i].types[j] == 'street_number') {
                    if (ata.editaddressdata.street != '') {
                        ata.editaddressdata.street = ata.editaddressdata.street + ',' + locationa.address_components[i].long_name;
                    } else {
                        ata.editaddressdata.street = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
                    if (ata.editaddressdata.street != '') {
                        ata.editaddressdata.street = ata.editaddressdata.street + ',' + locationa.address_components[i].long_name;
                    } else {
                        ata.editaddressdata.street = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'locality') {

                    ata.editaddressdata.city = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'country') {

                    ata.editaddressdata.country = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'postal_code') {

                    ata.editaddressdata.zipcode = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'administrative_area_level_1' || locationa.address_components[i].types[j] == 'administrative_area_level_2') {
                    ata.editaddressdata.state = locationa.address_components[i].long_name;
                }
            }
        }
    };
    ata.ok = function (valid) {
        if (valid == true) {
            $modalInstance.close(ata);
        } else {
            toastr.error('Invalid Form')
        }
    };
    ata.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('quickRabbit.users').directive('cropImgChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.cropImgChange);
            element.bind('change', onChangeHandler);
        }
    };
})
