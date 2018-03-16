angular.module('quickRabbit.task').controller('taskCtrl', taskCtrl);

taskCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', '$uibModal', 'TaskService', 'TaskserviceResolve', 'toastr', '$state', 'AuthenticationService', 'CurrentUserTaskserviceResolve', 'MainService', '$translate', 'ngMeta'];
function taskCtrl($scope, $rootScope, $location, $stateParams, $uibModal, TaskService, TaskserviceResolve, toastr, $state, AuthenticationService, CurrentUserTaskserviceResolve, MainService, $translate, ngMeta) {
	var tac = this;
	var user = AuthenticationService.GetCredentials();

	tac.taskbaseinfo = {};
	$scope.location = {};
	tac.filter = {};
	tac.filter.location = { lat: '', lng: '' };
	tac.availability = 2;
	tac.taskbaseinfo.address = {};
	//tac.loctionflag = false;
	//tac.aboutflag = false;
	tac.addressList = [];

	if (TaskserviceResolve[0].SubCategoryInfo.name) {
		ngMeta.setTitle(TaskserviceResolve[0].SubCategoryInfo.name);
	}
	if (CurrentUserTaskserviceResolve[0]) {
		if (CurrentUserTaskserviceResolve[0].addressList.length > 0) {
			if (CurrentUserTaskserviceResolve[0]) {
				tac.currentuserid = CurrentUserTaskserviceResolve[0]._id;
				tac.addressList = CurrentUserTaskserviceResolve[0].addressList;
				var addlist = tac.addressList.filter(function (el) { return el.status == 3; });
				if (addlist.length > 0) {
					tac.filter.address = addlist[0]._id;
				} else if (CurrentUserTaskserviceResolve[0].addressList[0]) {
					tac.filter.address = CurrentUserTaskserviceResolve[0].addressList[0]._id;
				}
			} else {
				tac.currentuserid = "";
			}
		} else {
			if (CurrentUserTaskserviceResolve[0]) {
				tac.currentuserid = CurrentUserTaskserviceResolve[0]._id;
				tac.addressList = CurrentUserTaskserviceResolve[0].addressList;
				tac.filter.address = "";
			} else {
				tac.currentuserid = "";
			}
		}
	}

	if (TaskserviceResolve.length > 0) {
		tac.taskbaseinfo.SubCategoryInfo = TaskserviceResolve[0].SubCategoryInfo;

	} else {
		$translate('WE ARE LOOKING FOR THIS TROUBLE SORRY UNABLE TO FETCH DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		$state.go('landing', {}, { reload: false });
	}

	tac.changeCategory = function (category) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'app/site/modules/task-step/views/change-category.html',
			controller: 'changeCategoryModalInstanceCtrl',
			controllerAs: 'CCM'
		});

		modalInstance.result.then(function (selectedCategoryData) {
			$state.go('landing', {}, { reload: false });
		}, function () { });
	};

	tac.placeChanged = function () {
		if (tac.filter.address) {
			var address = tac.addressList.filter(function (el) { return el._id == tac.filter.address; });
			if (address.length > 0) {
				tac.filter.location = address[0].location;
			} else if (CurrentUserTaskserviceResolve[0].addressList[0]) {
				tac.filter.location = CurrentUserTaskserviceResolve[0].addressList[0].location;
			}
			TaskService.checktaskeravailability(tac.filter.location, tac.taskbaseinfo.SubCategoryInfo._id).then(function (response) {
				if (angular.isDefined(response)) {
					if (response.count > 0) {
						tac.availability = 1;
					} else {
						tac.availability = 0;
					}
				}
			}, function (error) {
				tac.availability = 0;
			});
		}
	};
	/*

	tac.submitLocation = function () {
		//tac.loctionflag = false;
		if (tac.availability == 1) {
			//tac.loctionflag = true;
			//tac.aboutflag = true;
		}
	};
	*/
	tac.addressInfo = function (data) {
		TaskService.address(data).then(function (result) {
		});
	};

	tac.deleteaddress = function (index) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'app/site/modules/task-step/views/delete-confirm-model.html',
			controller: 'DeleteAddress',
			controllerAs: 'DATA',
			resolve: {
				user: function () {
					return tac.user;
				}
			}
		});
		modalInstance.result.then(function (userid) {
			TaskService.deleteaddress({ userid: user.currentUser.user_id, id: index }).then(function (response) {
				MainService.getCurrentUsers(user.currentUser.username).then(function (refdata) {
					tac.addressList = refdata[0].addressList;
				})
			});
		});
	}

	tac.addressStatus = function (id) {
		TaskService.addressStatus(id, user.currentUser.user_id).then(function (response) {
			MainService.getCurrentUsers(user.currentUser.username).then(function (refdata) {
				tac.addressList = refdata[0].addressList;
			})
		});
		$translate('PREFERRED ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
	}

	tac.Editaddress = function (index) {
		if (index >= 0) {
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'app/site/modules/task-step/views/addaddressmodel.html',
				controller: 'AddAddress',
				controllerAs: 'ATA',
				resolve: {
					user: function () {
						return tac.addressList[index];
					}
				}
			});
			modalInstance.result.then(function (data) {
				TaskService.AddAddress(user.currentUser.user_id, data).then(function (response) {
					$translate('ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
					MainService.getCurrentUsers(user.currentUser.username).then(function (refdata) {
						tac.addressList = refdata[0].addressList;
					})
				});
			});
		}
		else {
			MainService.getCurrentUsers(user.currentUser.username).then(function (refdata) {
				if (refdata[0].addressList.length < 5) {
					var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: 'app/site/modules/task-step/views/addaddressmodel.html',
						controller: 'AddAddress',
						controllerAs: 'ATA',
						resolve: {
							user: function () {
								return tac.addressList[index];
							}
						}
					});
					modalInstance.result.then(function (data) {
						TaskService.AddAddress(user.currentUser.user_id, data).then(function (response) {
							if (response.status == 0) {
								$translate('ADDRESS ALREADY ON YOUR LIST').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
							} else {
								$translate('ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
								MainService.getCurrentUsers(user.currentUser.username).then(function (refdata) {
									tac.addressList = refdata[0].addressList;
								})
							}
						});
					});
				} else {
					$translate('SORRY MORE THAN 5 ADDRESS COULD NOT BE ADDED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				}
			})
		}
	}





	tac.SearchTasker = function (taskavailable, valid) {
		console.log("sdfsdfsdfsdfsdfsdf", taskavailable)
		if (taskavailable == 0) {
			$translate('THE TASKER IS UN AVILABLE ON SELECTED ADDRESS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		}
		else {
			if (valid == true) {

				var address = tac.addressList.filter(function (el) { return el._id == tac.filter.address; });
				tac.temporaryAddress = address;
				console.log("address", address);
				if (address[0]) {
					tac.filter.location = address[0].location;
					var data = {};
					data.categoryid = tac.taskbaseinfo.SubCategoryInfo._id;
					data.address = tac.taskbaseinfo.address.line1;
					console.log("CurrentUserTaskserviceResolve[0].address", CurrentUserTaskserviceResolve[0].address);
					if (CurrentUserTaskserviceResolve[0].address) {
						data.billing_address = {
							'zipcode': CurrentUserTaskserviceResolve[0].address.zipcode || "",
							'country': CurrentUserTaskserviceResolve[0].address.country || "",
							'state': CurrentUserTaskserviceResolve[0].address.state || "",
							'city': CurrentUserTaskserviceResolve[0].address.city || "",
							'line2': CurrentUserTaskserviceResolve[0].address.line2 || "",
							'line1': CurrentUserTaskserviceResolve[0].address.line1 || ""
						};
					}
					else {
						data.billing_address = {
							'zipcode': address[0].zipcode || "",
							'country': address[0].country || "",
							'state': address[0].state || "",
							'city': address[0].city || "",
							'line2': address[0].street || "",
							'line1': address[0].line1 || ""
							
						};
					}
					data.userid = tac.currentuserid;
					data.categoryid = tac.taskbaseinfo.SubCategoryInfo._id;
					data.task_description = tac.filter.about;
					data.location = { 'lat': tac.filter.location.lat, 'log': tac.filter.location.lng };
					data.task_address = {
						'zipcode': address[0].zipcode || "",
						'country': address[0].country || "",
						'state': address[0].state || "",
						'city': address[0].city || "",
						'landmark': address[0].landmark || "",
						'line2': address[0].street || "",
						'line1': address[0].line1 || "",
						'lat': address[0].location.lat || "",
						'lng': address[0].location.lng || ""
					};

					TaskService.addtask(data).then(function (result) {
						tac.booking_id = result.booking_id;
						var option = {
							slug: tac.taskbaseinfo.SubCategoryInfo.slug,
							task: result._id
						};
						$state.go('search', option, { reload: false });
					}, function (error) {
						toastr.error(error);
					});
				} else {
					toastr.error("Click on the address to check provider availability and proceed");
				}
			}
		}
	}
}






angular.module('quickRabbit.task').controller('RegisterModalInstanceCtrl', function ($modalInstance, $filter, toastr, $scope, AuthenticationService, $cookieStore, $state, $translate) {
	var rcm = this;
	rcm.registerUser = function () {
		$modalInstance.close(rcm);
	};

	rcm.registerUser = function (isValid, formData) {
		rcm.Error = '';
		var today = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		if (isValid) {
			rcm.UserDetails.today = today;
			rcm.UserDetails.role = rcm.type;
			rcm.UserDetails.location = $scope.location;
			AuthenticationService.Register(rcm.UserDetails, function (err, response) {
				if (err) {
					for (var i = 0; i < err.length; i++) {
						toastr.error('Your credentials are wrong ' + err[i].msg + '--' + err[i].param);
					}
				} else {
					if (response.user == rcm.UserDetails.username) {
						AuthenticationService.SetCredentials(response.user, response.user_id, response.token, response.user_type, response.tasker_status);
						$cookieStore.remove('TaskerData');
						if (rcm.type == 'user') {
							$location.path('/');
						} else {
							$state.reload();
						}

					} else {
						$translate('EMAIL ID ALREADY EXISTS OR USER NAME EXISTS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
					}
				}
			});
		} else {
			$translate('INVALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		}
	};
});

angular.module('quickRabbit.task').controller('changeCategoryModalInstanceCtrl', function ($uibModalInstance) {
	var ccm = this;
	ccm.ok = function () {
		$uibModalInstance.close('ok');
	};
	ccm.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});


angular.module('quickRabbit.task').controller('AddAddress', function ($uibModalInstance, toastr, user, $location, $state, $scope, $translate) {
	var ata = this;
	console.log("in");
	ata.editaddressdata = user;
	$scope.location = {};
	ata.addressList = {};
	ata.addressList.location = { lat: '', lng: '' };
	ata.placeChanged = function () {

		console.log("inside");

		ata.place = this.getPlace();

		ata.addressList.location.lat = ata.place.geometry.location.lat();
		ata.addressList.location.lng = ata.place.geometry.location.lng();
		ata.availability = 2;
		var locationa = ata.place;
		console.log("locationa.address_components", locationa.address_components);

		for (var i = 0; i < locationa.address_components.length; i++) {
			for (var j = 0; j < locationa.address_components[i].types.length; j++) {
				if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
					ata.editaddressdata.line1 = locationa.address_components[i].long_name;
				}
				if (locationa.address_components[i].types[j] == 'route' || locationa.address_components[i].types[j] == 'street_number') {
					ata.editaddressdata.street = locationa.address_components[i].long_name;
				}
				if (locationa.address_components[i].types[j] == 'sublocality_level_2') {
					ata.editaddressdata.city = locationa.address_components[i].long_name;
				}
				if (locationa.address_components[i].types[j] == 'locality') {

					ata.editaddressdata.locality = locationa.address_components[i].long_name;
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
	ata.ok = function (isValid) {
		if (isValid == true) {
			$uibModalInstance.close(ata);
		} else {
			$translate('INVALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		}
	};
	ata.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

angular.module('quickRabbit.task').controller('DeleteAddress', function ($uibModalInstance, user, $state) {
	var data = this;
	data.ok = function () {
		$uibModalInstance.close();
	};
	data.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

angular.module('quickRabbit.task').directive('setClassWhenAtTop', function ($window) {
	var $win = angular.element($window);

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var topClass = attrs.setClassWhenAtTop
			offsetTop = element.offset().top;
			$win.on('scroll', function (e) {
				if ($win.scrollTop() >= offsetTop) {
					element.addClass(topClass);
				} else {
					element.removeClass(topClass);
				}
			});
		}
	};
})
