angular.module('quickRabbit.admin').directive('modalbtn', function($modal, $state){

    return {
        restrict: 'EA',
        scope: {
            size: "@",
            data: "=",
            dataCalling: "&dataCalling"
        },
        link: function(scope, element, attrs) {
            scope.dataCalling();
		element.click(function(){
		if (!scope.size) { scope.size = "small"; }
			var modalInstance = $modal.open({
            templateUrl: 'app/admin/modules/common/views/modal/delete_confirm.html',
            controller: 'DeleteModalCtrl',
            size: 'small',
            resolve: {
                DataVariable: function () {
                    return scope.data;
                },
                UrlVariable: function () {
                    return scope.deletecall;
                }
            }
			});

		    modalInstance.result.then(function (selectedItem) {

            //plc.selected = selectedItem;


			/*$state.transitionTo($state.current, null, { reload: true, inherit: false, notify: true, location: false });*/
			/*

             PageService.getProductList().then(function(respo){
                plc.getPagesList = respo[0];
            });
			*/
			}, function () {
            toastr.error('Modal dismissed at: ' + new Date(), 'Error');
			});
        });
        }
    };
});

angular.module('quickRabbit.admin').controller('DeleteModalCtrl', DeleteModalCtrl);
DeleteModalCtrl.$inject = ['$scope', 'MainService', '$modalInstance', 'DataVariable', 'UrlVariable', 'toastr'];

function DeleteModalCtrl($scope, MainService, $modalInstance, DataVariable, UrlVariable, toastr) {

    $scope.data = DataVariable;

	$scope.deleteData = function() {
	if(DataVariable.constructor === Array)
	{
		var delvalue = [];
		for (var i = 0; i < $scope.data.length; i++) {
            if ($scope.data[i].selected == true) {
                delvalue.push($scope.data[i]._id);
            }
		}
	}else {
		var delvalue = $scope.data._id;
	}
	MainService.deleteDataCall(UrlVariable, delvalue).then(function(response) {
        if (response != 'wrong') {
            toastr.success('deleted successfully');
        } else {
           toastr.error('User logout successfully...');
        }
            $modalInstance.close();
    }, function(error) {
                        toastr.error('Deleted Failed');
                        $modalInstance.close();
		});
    };

	$scope.cancel = function() {
        $modalInstance.close();
    };
}
