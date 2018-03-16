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
            link: function (scope, element, attrs) {
                element.html(scope.template);
                $compile(element.contents())(scope);
            },
            scope: {
                content: '=content',
                options: '=options',
                template: '=template',
                currentpage: '=currentpage',
                filterDataArray: '=filterData',
                entrylimit: '=entrylimit',
                predicate: '=predicate',
                reverse: '=reverse',
                usertablesearch: '=usertablesearch'
            }
        };
    });

function customContentCtrl($scope, $modal, toastr) {
    var ccc = this;

    ccc.openDeleteModal = function openDeleteModal(size, data, options) {
        var modalInstance = $modal.open({
            templateUrl: 'app/admin/modules/common/views/modal/delete_confirm.html',
            controller: 'DeleteTestCtrl',
            size: size,
            resolve: {
                DataVariable: function () {
                    return data;
                },
                OptionsVariable: function () {
                    return options;
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {

            if (!$scope.predicate) {
                $scope.predicate = 'createdAt'
            }

            var sort = { field: $scope.predicate, order: $scope.reverse };
            options.getData($scope.currentpage, $scope.entrylimit, sort, $scope.usertablesearch);
        }, function () {
            //toastr.error('Modal dismissed at: ' + new Date(), 'Error');
        });
    }
}

function customTableCtrl($modal, toastr, $scope, $attrs, MainService) {

    var ctc = this;
    ctc.predicate = '';
    ctc.reverse = -1;

    if (ctc.filterDataArray) {
        ctc.temp = {
            data: {},
            alias: {}
        };

        for (var k = 0; k < ctc.filterDataArray.length; k++) {
            ctc.temp.data[ctc.filterDataArray[k].name] = 0;
            ctc.temp.alias[ctc.filterDataArray[k].name] = ctc.filterDataArray[k].alias;

        }
        for (var j = 0; j < ctc.dataLength; j++) {
            ctc.data[j].selected = false;
            for (var i = 0; i < ctc.filterDataArray.length; i++) {
                if (ctc.data[j][ctc.filterDataArray[i].variable] == ctc.filterDataArray[i].name) {
                    ctc.temp.data[ctc.filterDataArray[i].name]++;
                }
                if (ctc.filterDataArray[i].name == "all") {
                    ctc.temp.data[ctc.filterDataArray[i].name]++;
                }
            }
        }
    }
    ctc.order = function (predicate) {
        ctc.unSelectAll();
        ctc.predicate = predicate;
        ctc.reverse = (ctc.reverse == 1) ? -1 : 1;
        ctc.sort = { field: predicate, order: ctc.reverse };
        ctc.data.delete.getData(ctc.currentPage, ctc.entryLimit, ctc.sort);
    };

    ctc.totalItems = parseInt(ctc.data.count) || 0;

    ctc.currentPage = 1;
    ctc.entryLimit = 10;

    ctc.pageSizes = [5, 10, 50, 100];
    ctc.maxPaginationSize = 3;

    ctc.maxSize = Math.ceil(ctc.totalItems / ctc.entryLimit);

    ctc.selectAll = function (el, cp) {
        angular.forEach(ctc.data.data, function (user, key) {
            user.selected = ctc.selectedAll;
        });
    };

    ctc.selectCheck = function (data) {
        if (data.selected == false) {
            ctc.selectedAll = false;
        }
    };

    ctc.unSelectAll = function () {
        angular.forEach(ctc.data.data, function (data) {
            if (data.selected == true) {
                ctc.selectedAll = false;
                data.selected = false;
            }
        });
    };

    ctc.pageChange = function (currentPage, entryLimit, search) {
        ctc.data.delete.getData(currentPage, entryLimit, ctc.sort, search);
    };

    MainService.getmessagetemplate().then(function (response) {
        ctc.messagetemplate = response;
    });

    MainService.getmailtemplate().then(function (response) {
        ctc.mailtemplate = response;
    });

    ctc.sendbulkmail = function (value, value1, value2, template) {
        var delvalue = [];
        for (var i = 0; i < value1.length; i++) {
            if (value1[i].selected == true) {
                delvalue.push(value1[i]._id);
            }
        }

        if (delvalue == "") {
            toastr.error('Please select atleast one user');
        } else if (template == undefined) {
            toastr.error('Please select one template to send');
        } else {
            MainService.sendbulkmail(delvalue, template).then(function (response) {
                if (response) {
                    toastr.success('Success');
                }
            }, function (error) {
                toastr.error('Deleted Failed');
            });
        }
    };

    ctc.openDeleteModal = function openDeleteModal(action, data, options) {
        if (action == 'delete') {
            var modalInstance = $modal.open({
                templateUrl: 'app/admin/modules/common/views/modal/delete_confirm.html',
                controller: 'DeleteTestCtrl',
                resolve: {
                    DataVariable: function () {
                        return data;
                    },
                    OptionsVariable: function () {
                        return options;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                if (!ctc.predicate) { ctc.predicate = 'createdAt' }
                var sort = { field: ctc.predicate, order: ctc.reverse };
                options.getData(ctc.currentPage, ctc.entryLimit, sort, ctc.userTableSearch);
            }, function () {
                //toastr.error('Modal dismissed at: ' + new Date(), 'Error');
            });
        }
    }


    ctc.sendmail = function sendmail(data, type) {
        ctc.toastrValue = false;
        data.filter(function (value) {
            if (value.selected) {
                if (value.selected == true) {
                    ctc.toastrValue = true;
                }
            }

        });
        if (ctc.toastrValue == true) {
            var modalInstance = $modal.open({
                templateUrl: 'app/admin/modules/common/views/modal/mail.html',
                controller: 'SendMailCtrl',
                resolve: {
                    DataVariable: function () {
                        return data;
                    },
                    Type: function () {
                        return type;
                    },
                    Email: function () {
                        return ctc.mailtemplate;
                    }
                }
            });
        } else {
            toastr.error("Please select Mail Id To Send");
        }
    }

    ctc.sendnotification = function sendnotification(data, type) {
        ctc.toastrValue = false;
        data.filter(function (value) {
            if (value.selected) {
                if (value.selected == true) {
                    ctc.toastrValue = true;
                }
            }

        });

        if (ctc.toastrValue == true) {
            var modalInstance = $modal.open({
                templateUrl: 'app/admin/modules/common/views/modal/message.html',
                controller: 'SendMessageCtrl',
                resolve: {
                    DataVariable: function () {
                        return data;
                    },
                    Type: function () {
                        return type;
                    },
                    Message: function () {
                        return ctc.messagetemplate;
                    }
                }
            });
        } else {
            toastr.error("Please select Mail Id To Send");
        }
    }

    if (ctc.filterDataArray) {
        ctc.temp = {
            data: {},
            alias: {},
            count: {}
        };
        for (var k = 0; k < ctc.filterDataArray.length; k++) {
            ctc.temp.data[ctc.filterDataArray[k].name] = 0;
            ctc.temp.alias[ctc.filterDataArray[k].name] = ctc.filterDataArray[k].alias;
            ctc.temp.count[ctc.filterDataArray[k].name] = ctc.filterDataArray[k].count;
        }


        for (var j = 0; j < ctc.data.length; j++) {
            ctc.data[j].selected = false;
            for (var i = 0; i < ctc.filterDataArray.length; i++) {
                ctc.temp.data[ctc.filterDataArray[i].name] = ctc.filterDataArray[i].count;
                /*if(ctc.data[j][ctc.filterDataArray[i].variable] == ctc.filterDataArray[i].name) {
                    ctc.temp.data[ctc.filterDataArray[i].name]++;
                }
                if(ctc.filterDataArray[i].name=="all"){
                     ctc.temp.data[ctc.filterDataArray[i].name]++;
                }*/
            }
        }

    }



}

//=============================== Delete Module ===============================
angular.module('quickRabbit.admin').controller('DeleteTestCtrl', DeleteTestCtrl);
DeleteTestCtrl.$inject = ['$scope', 'MainService', '$modalInstance', 'DataVariable', 'OptionsVariable', 'toastr'];
function DeleteTestCtrl($scope, MainService, $modalInstance, DataVariable, OptionsVariable, toastr) {
    $scope.data = DataVariable;
    $scope.deleteData = function () {
        if (DataVariable.constructor === Array) {
            var delvalue = [];
            for (var i = 0; i < $scope.data.length; i++) {
                if ($scope.data[i].selected == true) {
                    delvalue.push($scope.data[i]._id);
                }
            }
        } else {
            var delvalue = $scope.data._id;
        }
        MainService.deleteDataCall(OptionsVariable.service, delvalue).then(function (response) {
            toastr.success('Deleted successfully');
            $modalInstance.close();
        }, function (error) {
            if (error.message) {
                toastr.error(error.message);
                $modalInstance.close();
            } else {
                // toastr.error('Deleted Failed');
                toastr.error('Select Option to Delete');
                $modalInstance.close();
            }

        });
    };
    $scope.cancel = function () {
        $modalInstance.close();
    };
}


angular.module('quickRabbit.admin').controller('SendMailCtrl', SendMailCtrl);
SendMailCtrl.$inject = ['$scope', 'MainService', '$modalInstance', 'toastr', 'Email', 'DataVariable', 'Type'];
function SendMailCtrl($scope, MainService, $modalInstance, toastr, Email, DataVariable, Type) {

    $scope.emailtemplate = Email;

    $scope.cancel = function () {
        $modalInstance.close();
    };

    $scope.sendtemplatemail = function (template) {
        var delvalue = [];
        for (var i = 0; i < DataVariable.length; i++) {
            if (DataVariable[i].selected == true) {
                delvalue.push(DataVariable[i]._id);
            }
        }

        if (delvalue.length == 0) {
            toastr.error('Please select one user');
        }
        if (template == undefined) {
            toastr.error('Please select one template to send');
        } else {
            MainService.sendmessagemail(delvalue, template, Type).then(function (response) {
                if (response) {
                    toastr.success('Success');
                    $modalInstance.close();
                }
            }, function (error) {
                toastr.error('Deleted Failed');
            });
        }
    };
}



angular.module('quickRabbit.admin').controller('SendMessageCtrl', SendMessageCtrl);
SendMessageCtrl.$inject = ['$scope', 'MainService', '$modalInstance', 'toastr', 'Message', 'DataVariable', 'Type'];
function SendMessageCtrl($scope, MainService, $modalInstance, toastr, Message, DataVariable, Type) {

    $scope.emailtemplate = Message;
    $scope.cancel = function () {
        $modalInstance.close();
    };

    $scope.sendmessagemail = function (template) {
        var delvalue = [];
        for (var i = 0; i < DataVariable.length; i++) {
            if (DataVariable[i].selected == true) {
                delvalue.push(DataVariable[i]._id);
            }
        }
        if (delvalue.length == 0) {
            toastr.error('Please select one user');
        }
        if (template == undefined) {
            toastr.error('Please select one template to send');
        } else {
            MainService.sendmessage(delvalue, template, Type).then(function (response) {
                if (response) {
                    toastr.success('Success');
                    $modalInstance.close();

                }
            }, function (error) {
                toastr.error('Deleted Failed');
            });
        }
    };
}
