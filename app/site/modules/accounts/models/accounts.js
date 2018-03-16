var app = angular.module('quickRabbit.accounts');
app.factory('accountService', accountService);
function accountService($http, $q, Upload) {
    var accountService = {
        saveAccount: saveAccount,
        savePassword: savePassword,
        saveProfile: saveProfile,
        getCategories: getCategories,
        edit: edit,
        updatetaskstatus: updatetaskstatus,
        updatetaskstatuscash: updatetaskstatuscash,
        updatewalletdata: updatewalletdata,
        getmaincatname: getmaincatname,
        getwalletdetails: getwalletdetails,
        getsettings: getsettings,
        getQuestion: getQuestion,
        getChild: getChild,
        getCategoriesofuser: getCategoriesofuser,
        taskListService: taskListService,
        getTaskDetailsByStaus: getTaskDetailsByStaus,
        getTaskDetailsBytaskid: getTaskDetailsBytaskid,
        updateTask: updateTask,
        inserttaskerreview: inserttaskerreview,
        updateTaskcompletion: updateTaskcompletion,
        usercanceltask: usercanceltask,
        ignoreTask: ignoreTask,
        taskerconfirmTask: taskerconfirmTask,
        saveAvailability: saveAvailability,
        getExperience: getExperience,
        updateCategory: updateCategory,
        deleteCategory: deleteCategory,
        deactivateAccount: deactivateAccount,
        getReview: getReview,
        getuserReview: getuserReview,
        setReview: setReview,
        getTransactionHis: getTransactionHis,
        saveTaskerAccount: saveTaskerAccount,
        saveTaskerPassword: saveTaskerPassword,
        deactivateTaskerAccount: deactivateTaskerAccount,
        taskinfo: taskinfo,
        confirmtask: confirmtask,
        addUserReview: addUserReview,
        gettaskinfobyid: gettaskinfobyid,
        disputeUpdateTask: disputeUpdateTask,
        getTaskDetails: getTaskDetails,
        gettaskreview: gettaskreview,
        updateAvailability: updateAvailability,
        downloadPdf: downloadPdf,
        getcancelreason: getcancelreason,
        saveaccountinfo: saveaccountinfo,
        getUserTransaction: getUserTransaction,
        getUserTaskDetailsByStaus: getUserTaskDetailsByStaus,
        getseosetting: getseosetting,
        updatewalletdatapaypal: updatewalletdatapaypal
    };
    return accountService;

    function setReview(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/addReview',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveAccount(data) {
        //  console.log('user model', data)
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/settings/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function disputeUpdateTask(data, status) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/disputeupdateTask',
            data: { 'data': data, 'status': status }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function ignoreTask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/ignoreTask',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function taskerconfirmTask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/taskerconfirmtask',
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
            url: '/site/account/updateprofiledetails',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function savePassword(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/password/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveAvailability(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/availability/save',
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
            url: '/site/account/availability/update',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {

            deferred.reject(err);
        });
        return deferred.promise;
    }

    function edit(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/edit',
            data: data
        }).success(function (data) {
            deferred.resolve(data[0]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getCategories() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/categories/get'
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
            url: '/site/account/categories/getchild',
            data: { id: id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getTransactionHis(id, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/transcationhis',
            data: {
                id: id, skip: skip, limit: itemsPerPage
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getUserTransaction(id, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/usertranscation',
            data: {
                id: id, skip: skip, limit: itemsPerPage
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatewalletdata(data, user) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatewalletdata',
            data: { data: data, user: user }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getmaincatname(data) {
        console.log("data", data)
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getmaincatname',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function updatetaskstatus(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatetaskstatus',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatetaskstatuscash(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatetaskstatuscash',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatewalletdatapaypal(data, user) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatewalletdatapaypal',
            data: { data: data, user: user }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getwalletdetails(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getwalletdetails',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getsettings() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getsettings',
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    // By venki
    function getQuestion() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/account/question/getQuestion'
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

    function getCategoriesofuser(id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getcategoriesofuser',
            data: { _id: id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getTaskDetailsByStaus(Id, status, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskDetailsByStaus',
            data: { _id: Id, status: status, skip: skip, limit: itemsPerPage }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getUserTaskDetailsByStaus(Id, status, page, itemsPerPage) {

        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getUserTaskDetailsByStaus',
            data: { _id: Id, status: status, skip: skip, limit: itemsPerPage }
        }).success(function (data) {

            deferred.resolve(data);

        }).error(function (err) {
            deferred.reject(err);

        });
        return deferred.promise;
    }

    function getTaskDetailsBytaskid(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskDetailsBytaskid',
            data: data
        }).success(function (data) {
            deferred.resolve(data);

        }).error(function (err) {
            deferred.reject(err);

        });
        return deferred.promise;
    }


    function taskListService(Id, status, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskList',
            data: { _id: Id, status: status, skip: skip, limit: itemsPerPage }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function updateTask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updateTask',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function inserttaskerreview(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/insertaskerReview',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function updateTaskcompletion(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updateTaskcompletion',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function usercanceltask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/usercanceltask',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updateCategory(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatecategoryinfo',
            data: data,
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deactivateAccount(userid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/deactivateAccount',
            data: { userid: userid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deleteCategory(categoryinfo) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/deleteCategory',
            data: categoryinfo
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getReview(id, page, itemsPerPage, role) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getreview',
            data: { id: id, skip: skip, limit: itemsPerPage, role: role }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getuserReview(id, page, itemsPerPage, role) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getuserReview',
            data: { id: id, skip: skip, limit: itemsPerPage, role: role }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    //tasker -------------
    function saveTaskerAccount(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/tasker/settings/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function saveTaskerPassword(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/tasker/password/save',
            data: data
        }).success(function (data) {

            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deactivateTaskerAccount(userid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/deactivateTaskertAccount',
            data: { userid: userid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function taskinfo(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/taskinfo',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function confirmtask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/taskinfo',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function addUserReview(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/addReview',
            data: { data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function gettaskinfobyid(taskid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/gettaskbyid',
            data: { task: taskid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getTaskDetails(userid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskDetails',
            data: { _id: userid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function gettaskreview(taskid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/gettaskreview',
            data: { taskid: taskid }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function downloadPdf(_id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/downloadPdf',
            data: { _id: _id }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getcancelreason(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getcancelreason',
            data: { type: data }
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
            url: '/site/account/saveaccountinfo',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getseosetting() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getseosetting'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}