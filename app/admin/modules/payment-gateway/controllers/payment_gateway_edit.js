angular.module('quickRabbit.paymentGateway').controller('editPaymentCtrl', editPaymentCtrl);
editPaymentCtrl.$inject = ['PaymentGatewayEditServiceResolve', 'PaymentGatewayService', 'toastr', '$state'];

function editPaymentCtrl(PaymentGatewayEditServiceResolve, PaymentGatewayService, toastr, $state) {
    var epaygc = this;

	// Showing Payment Gateway Setting From Database

		if(PaymentGatewayEditServiceResolve[0] != null) { // Validating Invalid Output
			epaygc.editPaymentData = PaymentGatewayEditServiceResolve[0];
			epaygc.editPaymentData.status = epaygc.editPaymentData.status.toString();
		} else {
			$state.go('app.paymentgateway.list', {}, {reload: true});
		}

	// Payment Gateway Setting Updating
    epaygc.submitPaymetData = function submitPaymetData(isValid, data) {
		if (isValid) {
			PaymentGatewayService.save(data).then(function(response) {
			if(response.errors){
				//Server Side Validation For User Data
				for (i = 0; i < response.errors.length; i++) {
					toastr.error(response.errors[i].msg);
				}
			}
			else
			{
				toastr.success('Payment Gateway Settings Saved Sucessfully');
        	$state.go('app.paymentgateway.list');
			}
        }, function(err) {
            toastr.error('Sorry, Something went wrong');
        });
		} else{
			toastr.error('Validation errors occurred. Please confirm the fields and submit it again.');
		}
    }
}
