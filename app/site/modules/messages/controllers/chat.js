angular.module('quickRabbit.messages').controller('chatCtrl', chatCtrl);

chatCtrl.$inject = ['ChatServiceResolve', '$state', 'toastr', '$filter', 'AuthenticationService', 'TaskProfileResolve', 'MainService', '$stateParams', 'socket', '$scope', '$rootScope', 'TaskServiceResolve', 'TaskService', 'CurrentuserResolve', '$translate'];
function chatCtrl(ChatServiceResolve, $state, toastr, $filter, AuthenticationService, TaskProfileResolve, MainService, $stateParams, socket, $scope, $rootScope, TaskServiceResolve, TaskService, CurrentuserResolve, $translate) {
    var chat = this;
    var user = AuthenticationService.GetCredentials();
    chat.currentusertype = CurrentuserResolve.user_type;
    chat.taskerDetails = TaskProfileResolve;

    if (chat.currentusertype == 'user') {
        chat.CurrentType = "Tasker Name";
        if (TaskServiceResolve.tasker) {
          chat.UserName = TaskServiceResolve.tasker.username;
          chat.currentname = TaskServiceResolve.tasker.name.first_name;
        } else {
            chat.UserName = chat.taskerDetails.username;
            chat.currentname = chat.taskerDetails.name.first_name;

        }

        MainService.getCurrentUsers(user.currentUser.username).then(function (result) {
            chat.currentUserData = result[0];
        }, function (error) {
            $translate('INIT CURRENT DATA ERROR').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        });
    }
    if (chat.currentusertype == 'tasker') {
        chat.CurrentType = "User Name";
        chat.UserName = TaskServiceResolve.user.username;
        chat.currentname = TaskServiceResolve.user.name.first_name;
        MainService.getCurrentTaskers(user.currentUser.username).then(function (result) {
            chat.currentUserData = result[0];
        }, function (error) {
            $translate('INIT CURRENT DATA ERROR').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        });
    }



    chat.currentUser = user.currentUser.user_id;

    chat.data = ChatServiceResolve;
    if (chat.data) {
        var data = {};
        data.task = $stateParams.task;
        data.user = $stateParams.user;
        data.tasker = $stateParams.tasker;
        data.type = user.currentUser.user_type;
        socket.emit('message status', data);
    }

    chat.messages = ChatServiceResolve.messages || [];
    chat.taskinfo = TaskServiceResolve;
    //console.log("TaskServiceResolve",TaskServiceResolve);

    $rootScope.$emit('notification', { user: $rootScope.userId, type: $rootScope.usertype });

    chat.typing = {};
    chat.typing.status = false;

    if (user.currentUser.user_type == 'tasker') {
        chat.typing.message = 'User is typing. . .';
    } else if (user.currentUser.user_type == 'user') {
        chat.typing.message = 'Tasker is typing. . .';
    }

    chat.taskinfo.amount = $filter('filter')(chat.taskerDetails.taskerskills, { "childid": chat.taskinfo.category._id })[0].hour_rate;

    chat.send = function saveChat(message) {
        if (user.currentUser.user_type == 'tasker') {
            var data = { 'user': $stateParams.user, 'tasker': $stateParams.tasker, 'message': message, 'task': $stateParams.task, 'from': chat.currentUser };
        } else if (user.currentUser.user_type == 'user') {
            var data = { 'user': $stateParams.user, 'tasker': $stateParams.tasker, 'message': message, 'task': $stateParams.task, 'from': chat.currentUser };
        }
        if (message) {
            socket.emit('new message', data);
        }
        $scope.message = '';
    };

    chat.ontyping = function ontyping(message) {
        var data = {};
        if (user.currentUser.user_type == 'tasker') {
            data.from = $stateParams.tasker;
            data.to = $stateParams.user;
        } else if (user.currentUser.user_type == 'user') {
            data.from = $stateParams.user;
            data.to = $stateParams.tasker;
        }
        data.task = $stateParams.task;
        data.user = $stateParams.user;
        data.tasker = $stateParams.tasker;
        data.type = user.currentUser.user_type;

        socket.emit('start typing', data);
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= 400) {
                socket.emit('stop typing', data);
            }
        }, 400);
    };

    chat.confirmatask = function confirmatask(message) {
        chat.taskinfo.status = message;
        chat.taskinfo.tasker = $stateParams.tasker;
        chat.taskinfo.hourly_rate = chat.taskinfo.amount;

        /*chat.taskinfo.billing_address = {
            'zipcode': chat.currentUserData.address.zipcode || "",
            'country': chat.currentUserData.address.country || "",
            'state': chat.currentUserData.address.state || "",
            'city': chat.currentUserData.address.city || "",
            'line2': chat.currentUserData.address.line2 || "",
            'line1': chat.currentUserData.address.line1 || ""
        };*/

        chat.taskinfo.invoice = {
            'amount': {
                "minimum_cost": chat.taskinfo.category.commision,
                "task_cost": chat.taskinfo.category.commision,
                "total": chat.taskinfo.category.commision,
                "grand_total": chat.taskinfo.category.commision
            }
        };

        chat.taskinfo.booking_information = {
            //'service_id': chat.taskinfo.category.parent,
            'service_type': chat.taskinfo.category.name,
            'work_type': chat.taskinfo.category.name,
            'work_id': chat.taskinfo.category._id,
            'instruction': chat.taskinfo.task_description,
            'booking_date': '',
            'reach_date': '',
            'est_reach_date': '',
            'job_email': chat.taskerDetails.email,
            'location': '',
            'user_latlong': {
                'lon': chat.taskinfo.location.log,
                'lat': chat.taskinfo.location.lat
            }
        };
        //chat.taskinfo.card = { number: '', exp_month: '', exp_year: '', cvc: '' };
        TaskService.confirmtask(chat.taskinfo).then(function (result) {
            if (chat.taskinfo.status == 2) {
                $translate('TASK ACCEPTED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            }
            else {
                $translate('REQUEST HAS BEEN SENT TO TASKER SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            }
            $state.go('landing', { reload: false });
        }, function (error) {
            toastr.error(error);
        });
    };

    //*********************** SOCKET LISTENER ******************************//

    function webupdatechat(data) {
	console.log("dataforwebupdatechat",data);
        if (chat.data.task == data.task && chat.data.tasker._id == data.tasker && chat.data.user._id == data.user) {
            chat.messages.push(data.messages[0]);
            if (data.messages[0].from != chat.currentUser) {
                data.currentuserid = $rootScope.userId;
                data.usertype = $rootScope.usertype;
                socket.emit('single message status', data);
            }
            setTimeout(function () {
                $("#chatscroll").scrollTop($("#chatscroll").scrollTop() + $("#chatscroll .chat-cnt:last").position().top)
            }, 0);
        }
    }

    function singlemessagestatus(data) {
	console.log("singlemessagestatusinangular",data)
        chat.messages = chat.messages.map(function (message) {
            if (message._id == data.messages[0]._id) {
                var usertype = chat.currentusertype;
                if (usertype == 'user') {
                    message.tasker_status = 2;
                } else if (usertype == 'tasker') {
                    message.user_status = 2;
                }
            }
            return message;
        });
    }

    function messagestatus(data) {
        if (chat.data.task == data.task && chat.data.tasker._id == data.tasker && chat.data.user._id == data.user) {
            chat.messages = data.messages;
        }
    }

    function starttyping(data) {
        if (chat.data.task == data.chat.task && chat.data.tasker._id == data.chat.tasker && chat.data.user._id == data.chat.user) {
            chat.typing.status = true;
        }
    }

    function stoptyping(data) {
        if (chat.data.task == data.chat.task && chat.data.tasker._id == data.chat.tasker && chat.data.user._id == data.chat.user) {
            chat.typing.status = false;
        }
    }

    socket.on('webupdatechat', webupdatechat);
    socket.on('single message status', singlemessagestatus);
    socket.on('message status', messagestatus);
    socket.on('start typing', starttyping);
    socket.on('stop typing', stoptyping);

    $scope.$on('$destroy', function (event) {
        socket.removeListener('webupdatechat', webupdatechat);
        socket.removeListener('single message status', singlemessagestatus);
        socket.removeListener('message status', messagestatus);
        socket.removeListener('start typing', starttyping);
        socket.removeListener('stop typing', stoptyping);
    });


}
