var app = angular.module('quickRabbit.taskers');
app.factory('TaskersService', TaskersService);
TaskersService.$inject = ['$http', '$q', 'Upload'];

function TaskersService($http, $q, Upload) {

    var TaskersService = {

        getAllTaskers: getAllTaskers,
        addTaskergeneral: addTaskergeneral,
        savetaskerpassword: savetaskerpassword,
        saveNewTaskerPassword: saveNewTaskerPassword,
        saveProfile: saveProfile,
        saveaccountinfo: saveaccountinfo,
        addUser: addUser,
        changePassword: changePassword,
        editUserCall: editUserCall,
        edit: edit,
        getQuestion: getQuestion,
        exporttaskerData: exporttaskerData,
        //saveNewVehicle: saveNewVehicle,
        getCategories: getCategories,
        getExperience: getExperience,
        gettaskercategory: gettaskercategory,
        addCategory: addCategory,
        addNewCategory: addNewCategory,
        saveAvailability: saveAvailability,
        addTasker: addTasker,
        saveProf: saveProf,
        approvtaskercategory: approvtaskercategory,
        newsaveAvail: newsaveAvail,
        deleteCategory: deleteCategory,
        updateAvailability:updateAvailability,
        getChild:getChild,
        getSettings:getSettings,
        defaultCurrency:defaultCurrency,
        getDeletedTaskers:getDeletedTaskers




    };
    return TaskersService;

    function defaultCurrency(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/currency/default',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getAllTaskers(status,limit, skip, sort, search) {
      var deferred = $q.defer();
            var data = {};
             data.status=status;
            data.sort = sort;
            data.search = search;
            data.limit = limit;
            data.skip = skip;

            $http({
                method: 'POST',
                url: '/taskers/getrecenttasker',
                data: data
            }).success(function (data) {
                deferred.resolve(data);
            }).error(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
    }



    function addUser(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/adduser',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function addTaskergeneral(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/addtaskergeneral',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    
     function addTasker(data) {
        var tasker = {};
        tasker.data = data;
        tasker.profile = data.profile_details;
        tasker.days = data.working_days;
        var deferred = $q.defer();
        $http({
            // Upload.upload({
            method: 'POST',
            url: '/taskers/addtasker',
           // data: { avatar: data.avatarBase64, 'tdata': JSON.stringify(data) }
            data: data
        }).success(function (data) {
            var id = "";
            id = data._id;
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function approvtaskercategory(data,status) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/approvtaskercategory',
            data: { data :data, status :status }
        }).then(function (data) {
            deferred.resolve(data);
          }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }


    function savetaskerpassword(value) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/savetaskerpassword',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveNewTaskerPassword(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/saveNewTaskerPassword',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

	function saveaccountinfo(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/saveaccountinfo',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveProfile(data) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/savetaskerprofile',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function saveProf(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/saveprof',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function changePassword(currentPwdData, pwdConfirmData, value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/users/changePassword',
            data: {
                pwdConfirmCheck: pwdConfirmData,
                currentPwdCheck: currentPwdData,
                changeData: value
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }


    function editUserCall(data) {


        var deferred = $q.defer();

        Upload.upload({
            url: '/users/save',
            arrayKey: '',
            data: data
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }


    function edit(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data[0]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getQuestion() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/get-question',
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    /*
    function saveNewVehicle(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/saveNew-vehicle',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    */

    function getUserCategories(id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/get-user-categories',
            data: { _id: id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getExperience() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/categories/get-experience'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getCategory(id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/category/getcategory',
            data: { _id: id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function gettaskercategory(id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/gettaskercategory',
            data: { _id: id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function category() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/category'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getCategories() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/getcategories'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function addCategory(data) {
        var deferred = $q.defer();
         $http({
            method: 'POST',
            url: '/taskers/addcategory',
            data: data,
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function addNewCategory(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/addNewCategory',
            data: data,
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deleteCategory(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/deletecategory',
            data: data
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
    function getExperience() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/getexperience'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function saveAvailability(data) {
      // console.log(data);
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/availability/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function newsaveAvail(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/newavailability/mapsave',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updateAvailability(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/updateAvailability',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getChild(id) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/taskers/getChild',
            data: {id:id}
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getSettings() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/general'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    function exporttaskerData() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/tools/exporttasker'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    function getDeletedTaskers(status,limit, skip, sort, search) {
      var deferred = $q.defer();
            var data = {};
             data.status=status;
            data.sort = sort;
            data.search = search;
            data.limit = limit;
            data.skip = skip;

            $http({
                method: 'POST',
                url: '/taskers/getDeletedTaskers',
                data: data
            }).success(function (data) {
                deferred.resolve(data);
            }).error(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
    }

}
