angular.module('quickRabbit.category')
	.controller('carddetailCtrl', carddetailCtrl);

carddetailCtrl.$inject = ['$scope', '$rootScope', '$window', '$stateParams', '$state', 'CarddetailResolve', 'CarddetailService', 'MainService', 'CurrentUserResolve', '$translate', '$location', '$anchorScroll', 'toastr'];
function carddetailCtrl($scope, $rootScope, $window, $stateParams, $state, CarddetailResolve, CarddetailService, MainService, CurrentUserResolve, $translate, $location, $anchorScroll, toastr) {

	var cdc = this;
	cdc.data = CarddetailResolve.taskdata[0];
	cdc.currentUser = CurrentUserResolve[0];

	if (cdc.data.status == 7 && cdc.data.invoice.status == 1) {
		cdc.paymentStatus = 'Completed';
	}

	CarddetailService.paymentmode().then(function (response) {
		cdc.paymentmode = response;
	});

	cdc.balance_amount = cdc.data.invoice.amount.balance_amount;
	cdc.difference = cdc.data.invoice.amount.grand_total - cdc.data.invoice.amount.balance_amount;

	if(cdc.data.invoice.amount.coupon && (cdc.difference == cdc.data.invoice.amount.discount)) {
	cdc.couponbtn = 0;
	cdc.coupon = cdc.data.invoice.coupon;
	}
	else{
	cdc.coupon = '';
	cdc.couponbtn = 1;
	}
	//cdc.couponAmount ='';
	cdc.couponVisible = false;
	cdc.applyCoupon = function payment(coupon) {
		if (coupon == undefined) {
			$translate('ENTER VALID COUPON CODE').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		} else {
			var data = {};
			data.coupon = coupon;
			data.task = CarddetailResolve.taskdata[0]._id;
			data.user = CurrentUserResolve[0]._id;
			CarddetailService.applyCoupon(data).then(function (response) {
				cdc.couponVisible = true;
				cdc.couponAmount = response[0].invoice.amount.coupon;
				cdc.couponbtn = 0;
				cdc.data = CarddetailResolve.taskdata[0];
				console.log("cdc.data",cdc.data)

				//var extra_amount = response[0].invoice.amount.extra_amount || 0;
				cdc.grandtotal = response[0].invoice.amount.grand_total;
				cdc.balance_amount = response[0].invoice.amount.balance_amount;
				$translate('SAVED SUCCESSFULLY').then(function (headline) {
					toastr.success(headline);
				}, function (translationId) {
					toastr.success(headline);
				});
			}, function (err) {
				$scope.addAlert('danger', err.message);
			});
		}
	};


	cdc.removeCoupon = function payment(coupon) {
		if (coupon == undefined) {
			$translate('ENTER VALID COUPON CODE').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		} else {
			var data = {};
			data.coupon = coupon;
			data.task = CarddetailResolve.taskdata[0]._id;
			data.user = CurrentUserResolve[0]._id;
			CarddetailService.removeCoupon(data).then(function (response) {
			console.log("response",response)
			cdc.couponVisible = false;

				cdc.couponbtn = 1;
				cdc.grandtotal = response[0].invoice.amount.grand_total;
				cdc.balance_amount = response[0].invoice.amount.balance_amount;
				cdc.coupon = '';
				cdc.data = CarddetailResolve.taskdata[0];
				cdc.data.invoice.amount.grand_total = response[0].invoice.amount.grand_total;
				cdc.data.invoice.amount.balance_amount = response[0].invoice.amount.balance_amount;
				cdc.data.invoice.amount.coupon = 0;
				$translate('SAVED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
				//$scope.addAlert('success', 'Saved Successfully');
			}, function (err) {
				$scope.addAlert('danger', err.message);
			});
		}
	};

	cdc.walletpayment = function walletpayment(data, coupon) {
	console.log("data.invoice.amount.balance_amount",data.invoice.amount.balance_amount)
		var walletdata = {};
		if(cdc.balance_amount){
            walletdata.amount = cdc.balance_amount;
        }
        else{
        walletdata.amount = data.invoice.amount.balance_amount;
		}
		walletdata.taskid = data._id;
		walletdata.taskerid = data.tasker._id;
		walletdata.userid = data.user._id;
		walletdata.createdat = data.createdAt;
		CarddetailService.walletpayment(walletdata).then(function (response) {
			cdc.data = response;
			console.log("cdc.data",cdc.data)
			if (cdc.data.payment_type == "wallet-other" && cdc.data.status != 7) {
				cdc.couponbtn = 1;
				cdc.paymentStatus = 'Wallet money over';
				// cdc.data1 = CarddetailResolve.taskdata[0];
				cdc.balance_amount = cdc.data.invoice.amount.balance_amount;
			}
			else if (cdc.data.status == 0) {
				$translate('Recharge Your Wallet').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				cdc.data = CarddetailResolve.taskdata[0];
			}
			else {
				cdc.paymentStatus = 'completed';
				$state.go('account');
				$translate('PAYMENT_COMPLETED').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
				CarddetailResolve.taskdata[0]._id;
			}
		}, function (err) {
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('UNABLE TO PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				//$scope.addAlert('danger', 'Unable Process Your Payment');
			}
		});
	};

	cdc.creditscroll = function creditscroll() {
		$location.hash('dopaymentcredit');
		$anchorScroll();
		$location.url($location.path());
	}

	cdc.payment = function payment(isValid) {
		if (isValid) {
			$location.hash('dopaymentcredit');
			$anchorScroll();
			$location.url($location.path());
			cdc.formdata = cdc.taskPayment;
			cdc.formdata.taskid = CarddetailResolve.taskdata[0]._id;
			CarddetailService.confirmtask(cdc.formdata).then(function (response) {
				cdc.data = response;
				if (cdc.data.status == 7 && cdc.data.invoice.status == 1) {
					$state.go('account');
					$translate('PAYMENT_COMPLETED').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
					cdc.paymentStatus = 'completed';
					CarddetailResolve.taskdata[0]._id;
				}
			}, function (err) {
				if (err.message) {
					$scope.addAlert('danger', err.message);
				} else {
					$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				}
			});
		} else {
			$translate('PLEASE ENTER THE VALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
		}
	};


	cdc.couponCompltePayment = function couponCompltePayment(data) {
		var couponCompletedata = {};
		couponCompletedata.amount = data.invoice.amount.balance_amount;
		couponCompletedata.taskid = data._id;
		couponCompletedata.taskerid = data.tasker._id;
		couponCompletedata.userid = data.user._id;
		couponCompletedata.createdat = data.createdAt;
		CarddetailService.couponCompletePayment(couponCompletedata).then(function (response) {
			if (response) {
				cdc.data = response;
			}
			cdc.paymentStatus = 'completed';
			$state.go('account');
			$translate('PAYMENT_COMPLETED').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
			CarddetailResolve.taskdata[0]._id;

		}, function (err) {
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				//$scope.addAlert('danger', 'Unable Process Your Payment');
			}
		});
	};


	cdc.paypalPayment = function paypalPayment(data) {
		var paymentdetails = {};
		paymentdetails.task = data._id;
		paymentdetails.user = data.user._id;

		CarddetailService.paypalPayment(paymentdetails).then(function (response) {
			console.log("response", response);

			if (response.status == 1 && response.payment_mode == 'paypal') {
				$window.location.href = response.redirectUrl;
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				//$scope.addAlert('danger', 'Unable Process Your Payment');
			}
		}, function (err) {
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
				//$scope.addAlert('danger', 'Unable Process Your Payment');
			}
		});
	};

	cdc.payemntvalue = function payemntvalue(payemnt) {
		cdc.type = payemnt;
	}

	cdc.remitapayment = function remitapayment(remitaPaymentform, data) {
		cdc.formdata = cdc.remitaPaymentform;
		//cdc.formdata.amount	= cdc.data.invoice.amount.balance_amount;
		cdc.formdata.task = data._id;
		cdc.formdata.user = data.user._id;
		CarddetailService.remitaPayment(cdc.formdata).then(function (response) {
			if (response.status == 1 && response.payment_mode == 'remita') {
				$window.location.href = response.redirectUrl;
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
			}
		}, function (err) {
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
			}
		});
	};

}
