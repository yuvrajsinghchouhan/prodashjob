angular.module('quickRabbit.task').controller('taskFilterCtrl', taskFilterCtrl);

taskFilterCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', 'SearchResolve', 'TaskService', 'TaskserviceResolve', 'toastr', '$state', '$filter', 'AuthenticationService', '$modal', 'MainService', 'TaskServiceNewResolve', '$translate', 'ngMeta', 'TaskerCountResolve', 'NgMap', '$scope', '$q', '$log'];
function taskFilterCtrl($scope, $rootScope, $location, $stateParams, SearchResolve, TaskService, TaskserviceResolve, toastr, $state, $filter, AuthenticationService, $modal, MainService, TaskServiceNewResolve, $translate, ngMeta, TaskerCountResolve, NgMap, $scope, $q, $log) {

	var tfc = this;
	tfc.viewType = 'list'; // list or map
	var option = {};

	tfc.search = SearchResolve;
	tfc.taskinfo = TaskServiceNewResolve;
	tfc.page = TaskerCountResolve.count;
	 console.log("tfc.page",tfc.page);
	if(TaskserviceResolve[0].categorydetails){
		if(TaskserviceResolve[0].categorydetails.marker){
	tfc.marker = TaskserviceResolve[0].categorydetails.marker;
	}
	}

/*	console.log(TaskserviceResolve);
	console.log(TaskServiceNewResolve);
*/
	if (TaskserviceResolve[0].SubCategoryInfo.name) {
		ngMeta.setTitle(TaskserviceResolve[0].SubCategoryInfo.name);
	}



	var user = AuthenticationService.GetCredentials();
	MainService.getCurrentUsers(user.currentUser.username).then(function (result) {
		tfc.currentUserData = result[0];
	}, function (error) {
		$translate('INIT CURRENT DATA ERROR').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
	});

	MainService.getDefaultCurrency().then(function (response) {
		tfc.DefaultCurrency = response;
	});

	var stateParams = angular.copy($rootScope.currentparams);
	if (angular.isDefined(stateParams.categoryid)) {
		option.category = stateParams.category;
	}
	if (angular.isDefined(stateParams.task)) {
		option.task = stateParams.task;
	}


	tfc.filter = option;
	tfc.taskbaseinfo = {};
	tfc.currentPage = 1;
	tfc.itemsPerPage = 6;
	tfc.totalItem = tfc.page;
	tfc.format = 'MM/dd/yyyy';
	tfc.logincheck = AuthenticationService.isAuthenticated();
	if (TaskserviceResolve.length > 0) {
		tfc.taskbaseinfo.SubCategoryInfo = TaskserviceResolve[0].SubCategoryInfo;
	} else {
		$translate('WE ARE LOOKING FOR THIS TROUBLE SORRY UNABLE TO FETCH DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		$state.go('landing', {}, { reload: false });
	}
	if (angular.isDefined(tfc.filter.date) && tfc.filter.date != '') {
		tfc.WorkingDate = new Date(tfc.filter.date);
		if (tfc.WorkingDate == 'Invalid Date') {
			tfc.WorkingDate = new Date();
		}
	} else {
		tfc.WorkingDate = new Date();
	}

	tfc.FullDate = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	tfc.filter.day = tfc.FullDate[tfc.WorkingDate.getDay()];
	tfc.filter.date = $filter('date')(tfc.WorkingDate, tfc.format, '');
	tfc.hours = {
		morning: false,
		afternoon: false,
		evening: false
	};
	if (angular.isDefined(tfc.filter.hour)) {
		if (tfc.filter.hour == "morning") {
			tfc.hours.morning = true;
		} else if (tfc.filter.hour == "afternoon") {
			tfc.hours.afternoon = true;
		} else if (tfc.filter.hour == "evening") {
			tfc.hours.evening = true;
		} else {
			tfc.filter.hour = 'morning';
			tfc.hours.morning = true;
		}
	} else {
		tfc.filter.hour = 'morning';
		tfc.hours.morning = true;
	}

	tfc.teskerErrorMsg = function () {
		toastr.error('Own task can\'t continue');
	};

	tfc.filter.categoryid = tfc.taskbaseinfo.SubCategoryInfo._id;
	tfc.getTaskerDetailsResponse = false;

	if (tfc.search.minRate == tfc.search.maxRate) {
		tfc.min = tfc.filter.minvalue = tfc.search.minRate || 0;
		tfc.max = tfc.filter.maxvalue = tfc.min + 200;
	}
	else {
		tfc.min = tfc.filter.minvalue = tfc.search.minRate || 0;
		tfc.max = tfc.filter.maxvalue = tfc.search.maxRate || 500;
	}
	tfc.UIslide = [tfc.min, tfc.max];
	$scope.$watchCollection('DefaultCurrency', function (newNames, oldNames) {
		tfc.min = (tfc.min).toFixed(2);
		tfc.max = (tfc.max).toFixed(2);
	});

	tfc.changeViewType = function (type) {
		tfc.viewType = type;
		tfc.getTaskerDetails();
		NgMap.getMap().then(function (map) {
			$scope.map = map;
		});
	}


	tfc.getTaskerDetails = function () {
	 //console.log("tfc.currentPage",tfc.currentPage);
	 //console.log("tfc.itemsPerPage",tfc.itemsPerPage);
		if (tfc.UIslide) {
			tfc.filter.minvalue = tfc.UIslide[0];
			tfc.filter.maxvalue = tfc.UIslide[1];
		}
		tfc.TaskerDetails = [];
		tfc.getTaskerDetailsResponse = false;

		tfc.dummyarrayValue = [];
		if ($rootScope.currentState.name != 'search') {
			$state.go($rootScope.currentState, $rootScope.currentparams, { reload: false, inherit: true, notify: true });
		} else {
		// console.log("adfasdfasdfasdfad",tfc.filter, tfc.currentPage, tfc.itemsPerPage)

	//console.log(">>>>>",tfc.viewType);
	if(tfc.viewType == 'list'){
		TaskService.getTaskerByGeoFilter(tfc.filter, tfc.currentPage, tfc.itemsPerPage).then(function (response) {
			//console.log("response*/*/*/",response);
			if(angular.isDefined(response.countall)){
				tfc.totalItem = response.countall;
			}
			if (angular.isDefined(response.result)) {
				tfc.TaskerDetails = response.result;
				angular.forEach(tfc.TaskerDetails, function (value, key) {
					angular.forEach(value.taskerskills, function (value1, key1) {
						if (value1.childid == tfc.filter.categoryid) {
							tfc.dummyarrayValue.push(value1);
						}
					});
				});
			}
			if (angular.isDefined(response.avgrating)) {
				tfc.avgtasker = response.avgrating;
				// console.log('tfc.avgtasker',tfc.avgtasker)
			}
			if (angular.isDefined(response.taskercount)) {
				tfc.taskercount = response.taskercount;
			}
			angular.forEach(tfc.TaskerDetails, function (value, key) {
				angular.forEach(tfc.avgtasker, function (value1, key1) {
					if (value._id == value1._id) {
						tfc.TaskerDetails[key].avarating = parseInt(value1.avg);
						//console.log("tfc.TaskerDetails[key].avarating",tfc.TaskerDetails[key].avarating)
						tfc.TaskerDetails[key].taskCount = parseInt(value1.datacount);
						tfc.TaskerDetails[key].recentReview = value1.documentData[value1.documentData.length - 1];
						if (value1.documentData[value1.documentData.length - 1].userdetails.avatar) {
							tfc.TaskerDetails[key].userAvater = value1.documentData[value1.documentData.length - 1].userdetails.avatar;
						}
					}
				});
			});

			angular.forEach(tfc.TaskerDetails, function (value, key) {
				angular.forEach(tfc.taskercount, function (value1, key1) {
					if (value._id == value1._id) {
						tfc.TaskerDetails[key].taskercount = value1.induvidualcount;

					}
				});
			});
			tfc.getTaskerDetailsResponse = true;
		}, function (error) { });
	}else{
			TaskService.getTaskerByGeoFiltermap(tfc.filter, tfc.currentPage, tfc.itemsPerPage).then(function (response) {
				if (angular.isDefined(response.result)) {
					tfc.TaskerDetails = response.result;
					// console.log("tfc.TaskerDetails******",tfc.TaskerDetails);
					angular.forEach(tfc.TaskerDetails, function (value, key) {
						angular.forEach(value.taskerskills, function (value1, key1) {
							if (value1.childid == tfc.filter.categoryid) {
								tfc.dummyarrayValue.push(value1);
							}
						});
					});

					/*Map*/
					$scope.lat = tfc.taskinfo.location.lat;
					$scope.lng = tfc.taskinfo.location.lng;
					$scope.markerData = [];
					$scope.cityMetaData = [];

					$scope.getCityInfo = function () {
						var TaskerData = [];
						for (var i = 0; i < tfc.TaskerDetails.length; i++) {
							var id = tfc.TaskerDetails[i];
							TaskerData.push({
								'id': i,
								'cityName': tfc.TaskerDetails[i].address.line1 + "," + tfc.TaskerDetails[i].address.state + "," + tfc.TaskerDetails[i].address.country,
								'TaskerName': tfc.TaskerDetails[i],
								'icon': tfc.TaskerDetails[i].avatar,
							});
						}
						TaskerData.forEach(function (item) {
							var cityData = item;
							$scope.cityMetaData.push(cityData);
							tfc.addressMarker(cityData);
						});
					}
					tfc.addressMarker = function (cityItem) {
						var deferred = $q.defer();
						var address = cityItem.TaskerName.availability_address;
						var geocoder = new google.maps.Geocoder();
						geocoder.geocode({
							'address': address
						}, function (results, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								$scope.$apply(function () {
									$scope.markerData.push({
										"id": cityItem.id,
										"latitude": results[0].geometry.location.lat(),
										"longitude": results[0].geometry.location.lng(),
										"title": results[0].formatted_address,
										"tasker": cityItem.TaskerName,
										"icon": cityItem.icon,
										"avatar": cityItem.TaskerName.avatar,
										"position": [results[0].geometry.location.lat(), results[0].geometry.location.lng()]
									});
								});
							} else {
								$log.info('Geocode was not successful for the following reason:' + status);
							}
						});
					}
					$scope.getCityInfo();
					tfc.showCity = function (event, cityItem) {
						$scope.selectedCity = cityItem;
						console.log("tasker data", $scope.selectedCity);
						$scope.map.showInfoWindow('myInfoWindow', 'm' + cityItem.id);
					}
					/*Map End*/
				}
				if (angular.isDefined(response.avgrating)) {
					tfc.avgtasker = response.avgrating;
				}

				if (angular.isDefined(response.taskercount)) {
					tfc.taskercount = response.taskercount;
				}
				angular.forEach(tfc.TaskerDetails, function (value, key) {
					angular.forEach(tfc.avgtasker, function (value1, key1) {
						if (value._id == value1._id) {
							tfc.TaskerDetails[key].avarating = parseInt(value1.avg);
							//console.log("tfc.TaskerDetails[key].avarating",tfc.TaskerDetails[key].avarating)
							tfc.TaskerDetails[key].taskCount = parseInt(value1.datacount);
							tfc.TaskerDetails[key].recentReview = value1.documentData[value1.documentData.length - 1];
							if (value1.documentData[value1.documentData.length - 1].userdetails.avatar) {
								tfc.TaskerDetails[key].userAvater = value1.documentData[value1.documentData.length - 1].userdetails.avatar;
							}
						}
					});
				});

				angular.forEach(tfc.TaskerDetails, function (value, key) {
					angular.forEach(tfc.taskercount, function (value1, key1) {
						if (value._id == value1._id) {
							tfc.TaskerDetails[key].taskercount = value1.induvidualcount;

						}
					});
				});
				tfc.getTaskerDetailsResponse = true;
			}, function (error) { });
		}

		}
	};

	tfc.timinglist = [
		{ value: "morning", time: "8AM - 9AM", data: "08:00" },
		{ value: "morning", time: "9AM - 10AM", data: "09:00" },
		{ value: "morning", time: "10AM - 11AM", data: "10:00" },
		{ value: "morning", time: "11AM - 12PM", data: "11:00" },
		{ value: "afternoon", time: "12PM - 1PM", data: "12:00" },
		{ value: "afternoon", time: "1PM - 2PM", data: "13:00" },
		{ value: "afternoon", time: "2PM - 3PM", data: "14:00" },
		{ value: "afternoon", time: "3PM - 4PM", data: "15:00" },
		{ value: "evening", time: "4PM - 5PM", data: "16:00" },
		{ value: "evening", time: "5PM - 6PM", data: "17:00" },
		{ value: "evening", time: "6PM - 7PM", data: "18:00" },
		{ value: "evening", time: "7PM - 8PM", data: "19:00" }
	];

	tfc.filterDate = function () {

		tfc.filter.day = tfc.FullDate[tfc.WorkingDate.getDay()];
		tfc.filter.date = $filter('date')(tfc.WorkingDate, tfc.format, '');

		tfc.timeValue = new Date();
		tfc.ttvalue = tfc.timeValue.getHours();
		tfc.thisMonth = tfc.timeValue.getMonth();
		tfc.thisDate = tfc.timeValue.getDate();
		tfc.timeDisabledValue = tfc.ttvalue + ":00";
		tfc.selectedDate = tfc.WorkingDate.getDate();
		tfc.selectedMonth = tfc.WorkingDate.getMonth();
		tfc.filterTiming = "";
		if ((tfc.selectedDate == tfc.thisDate)) {
			if (tfc.selectedMonth == tfc.thisMonth) {
				tfc.filterTiming = [];
				for (var i = 0; i < tfc.timinglist.length; i++) {
					if (tfc.timinglist[i].data > tfc.timeDisabledValue) {
						tfc.filterTiming.push(tfc.timinglist[i]);
					}
				}
			} else {
				tfc.filterTiming = tfc.timinglist;
			}
		}
		else {
			tfc.filterTiming = tfc.timinglist;
		}

		if (tfc.filterTiming.length) {
			tfc.dafaulttime = tfc.filterTiming[0].data;
		} else {
			tfc.WorkingDate.setDate(tfc.WorkingDate.getDate() + 1);
			tfc.filterTiming = tfc.timinglist;
			tfc.dafaulttime = tfc.filterTiming[0].data;
		}
		tfc.hourfilter(tfc.dafaulttime);
	}
	tfc.hourfilter = function (hour) {
		tfc.filter.time = hour;
		if (hour == "08:00" || hour == "09:00" || hour == "10:00" || hour == "11:00") {
			value = 'morning';
		} else if (hour == "12:00" || hour == "13:00" || hour == "14:00" || hour == "15:00") {
			value = 'afternoon';
		} else if (hour == "16:00" || hour == "17:00" || hour == "18:00" || hour == "19:00") {
			value = 'evening';
		}
		for (var i in tfc.hours) {
			if (value != i) {
				tfc.hours[i] = false;
			} else {
				tfc.hours[i] = true;
			}
		}
		if (tfc.filter.hour != value) {
			tfc.filter.hour = value;
			tfc.filter.time = hour;  // -- hour
		}
		tfc.getTaskerDetails();
	}

	tfc.registermodal = function (category) {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'app/site/modules/task-step/views/register.modal.tab.html',
			controller: 'RegisterModalInstanceCtrl',
			controllerAs: 'RCM'
		});
		modalInstance.result.then(function (userinfo) {
		}, function () {
		});
	};

	tfc.confirmatask = function confirmatask(message) {
		var date = {};
		date.currectdate = tfc.filter.date;
		date.time = tfc.filter.time;

		tfc.taskinfo.tasker = message.tasker._id;
		tfc.taskinfo.invoice = {
			'amount': {
				"minimum_cost": tfc.taskinfo.category.commision,
				"task_cost": tfc.taskinfo.category.commision,
				"total": tfc.taskinfo.category.commision,
				"grand_total": tfc.taskinfo.category.commision
			}
		};

		tfc.taskinfo.booking_information = {
			'service_type': tfc.taskinfo.category.name,
			'work_type': tfc.taskinfo.category.name,
			'work_id': tfc.taskinfo.category._id,
			'instruction': tfc.taskinfo.task_description,
			'booking_date': '',
			'reach_date': '',
			'est_reach_date': '',
			'location': tfc.taskinfo.billing_address.line1 + "," + tfc.taskinfo.billing_address.line2 + "," + tfc.taskinfo.billing_address.city + "," + tfc.taskinfo.billing_address.state + "," + tfc.taskinfo.billing_address.country + "," + tfc.taskinfo.billing_address.zipcode
		};

		tfc.taskinfo.history = {};
		tfc.taskinfo.history.job_booking_time = new Date();
		tfc.taskinfo.history.est_reach_date = '';
		tfc.taskinfo.status = 1;

		angular.forEach(message.tasker.taskerskills, function (value, key) {
			if (value.childid == tfc.taskinfo.category._id)
				tfc.hour_rate = value.hour_rate;
		});

		tfc.taskinfo.hourly_rate = tfc.hour_rate || ""
		var taskdatetime = new Date();
		tfc.taskinfo.task_hour = tfc.filter.hour;
		if (tfc.filter.time) {
			TaskService.confirmtask(tfc.taskinfo, date).then(function (result) {
				$translate('REQUEST HAS BEEN SENT TO TASKER SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
				$state.go('landing', { reload: false });
			}, function (error) {
				toastr.error(error);
			});
		}
		else {
			$translate('CHOOSE YOUR TASK TIME').then(function (headline) { toastr.info(headline); }, function (translationId) { toastr.error(headline); });
		}
	};
}

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
	//console.log("inside");
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
			//console.log("ata.editaddressdata.line1 ",ata.editaddressdata.line1 );
		}

		for (var i = 0; i < locationa.address_components.length; i++) {
			for (var j = 0; j < locationa.address_components[i].types.length; j++) {
				if (locationa.address_components[i].types[j] == 'neighborhood') {
					if (ata.editaddressdata.line1 != locationa.address_components[i].long_name) {
						if (ata.editaddressdata.line1 != '') {
							ata.editaddressdata.line1 = ata.editaddressdata.line1 + ',' + locationa.address_components[i].long_name;
						} else {
							//console.log("locationa.address_components[i].long_name",locationa.address_components[i].long_name);
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
			var topClass = attrs.setClassWhenAtTop,
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
