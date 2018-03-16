angular.module('quickRabbit.admin')

    .directive('customTable', function customTable($compile) {
        return {
            restrict: 'E',
            templateUrl: 'app/admin/modules/common/views/custom_table.html',
            scope: {
                data: '=data'
            },
            controller: customTableCtrl,
            controllerAs: 'CTC',
            bindToController: true
        };
    })

    .directive('contentItem', function ($compile) {
		return {
			restrict: "EA",
            controller: customContentCtrl,
            controllerAs: 'CCC',
			link:  function(scope, element, attrs) {
				element.html(scope.template);
				$compile(element.contents())(scope);
			},
			scope: {
				content:'=content',
				options:'=options',
				template:'=template'
			}
		};
	});

function customContentCtrl($scope,$modal, toastr){


    var ccc = this;

    ccc.openDeleteModal = function openDeleteModal(size, data, options) {
        var modalInstance = $modal.open({
            templateUrl: 'app/admin/modules/common/views/modal/delete_confirm.html',
            controller: 'DeleteTestCtrl',
            size: size,
            resolve: {
                DataVariable: function() {
                    return data;
                },
                OptionsVariable: function() {
                    return options;
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            options.getData(ccc.currentPage, ccc.entryLimit, ccc.predicate, ccc.reverse, ccc.userTableSearch);
        }, function() {
            toastr.error('Modal dismissed at: ' + new Date(), 'Error');
        });
    }
}

function customTableCtrl( $modal, toastr, $scope, $attrs) {

	var ctc = this;
    ctc.predicate = '';
    ctc.reverse = true;

    if(ctc.filterDataArray) {
        ctc.temp = {
            data: {},
            alias: {}
        };

        for(var k = 0; k < ctc.filterDataArray.length; k++) {
            ctc.temp.data[ctc.filterDataArray[k].name] = 0;
            ctc.temp.alias[ctc.filterDataArray[k].name] = ctc.filterDataArray[k].alias;

        }
        for(var j = 0; j < ctc.dataLength; j++) {
            ctc.data[j].selected = false;
            for(var i = 0; i < ctc.filterDataArray.length; i++) {
                if(ctc.data[j][ctc.filterDataArray[i].variable] == ctc.filterDataArray[i].name) {
                    ctc.temp.data[ctc.filterDataArray[i].name]++;
                }
                if(ctc.filterDataArray[i].name=="all"){
                     ctc.temp.data[ctc.filterDataArray[i].name]++;
				}
            }
        }
       }
    ctc.order = function(predicate) {
        ctc.unSelectAll();
        ctc.reverse = (ctc.predicate === predicate) ? !ctc.reverse : false;
        ctc.predicate = predicate;
        ctc.data.delete.getData(ctc.currentPage, ctc.entryLimit, predicate, ctc.reverse);
    };

	ctc.totalItems = ctc.data.count || 0;

    ctc.currentPage = 1;
    ctc.entryLimit = 10;

    ctc.pageSizes = [5, 10, 50, 100];
    ctc.maxPaginationSize = 3;

    ctc.maxSize = Math.ceil(ctc.totalItems / ctc.entryLimit);

    ctc.selectAll = function(el, cp) {

        angular.forEach(ctc.data.data, function(user, key) {
            user.selected = ctc.selectedAll;
        });
    };

    ctc.selectCheck = function(data) {
        if(data.selected == false) {
            ctc.selectedAll = false;
        }
    };

    ctc.unSelectAll = function() {
        angular.forEach(ctc.data.data, function(data) {
            if(data.selected == true) {
                ctc.selectedAll = false;
                data.selected = false;
            }
        });
    };
    ctc.pageChange = function(currentPage, entryLimit, search) {

        ctc.data.delete.getData(currentPage, entryLimit, ctc.predicate, ctc.reverse, search);
    };

    ctc.openDeleteModal = function openDeleteModal(size, data, options) {
        var modalInstance = $modal.open({
            templateUrl: 'app/admin/modules/common/views/modal/delete_confirm.html',
            controller: 'DeleteTestCtrl',
            size: size,
            resolve: {
                DataVariable: function() {
                    return data;
                },
                OptionsVariable: function() {
                    return options;
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {

            options.getData(ctc.currentPage, ctc.entryLimit, ctc.predicate, ctc.reverse, ctc.userTableSearch);
        }, function() {
            toastr.error('Modal dismissed at: ' + new Date(), 'Error');
        });
    }
}

//=============================== Delete Module ===============================
angular.module('quickRabbit.admin').controller('DeleteTestCtrl', DeleteTestCtrl);
DeleteTestCtrl.$inject = ['$scope', 'MainService', '$modalInstance', 'DataVariable', 'OptionsVariable', 'toastr'];
function DeleteTestCtrl($scope, MainService, $modalInstance, DataVariable, OptionsVariable, toastr){
    $scope.data = DataVariable;

    $scope.deleteData = function() {
        if(DataVariable.constructor === Array) {
            var delvalue = [];
            for(var i = 0; i < $scope.data.length; i++) {
                if($scope.data[i].selected == true) {
                    delvalue.push($scope.data[i]._id);
                }
            }
        }else {
            var delvalue = $scope.data._id;
        }
        MainService.deleteDataCall(OptionsVariable.service, delvalue).then(function(response) {
			toastr.success('Deleted successfully');
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
