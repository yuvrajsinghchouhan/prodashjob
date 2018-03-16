angular.module('quickRabbit.messages').controller('messagesCtrl', messagesCtrl);

messagesCtrl.$inject = ['MessageserviceResolve', 'MessageService', 'CurrentuserResolve', '$uibModal', 'toastr','$translate'];
function messagesCtrl(MessageserviceResolve, MessageService, CurrentuserResolve, $uibModal, toastr,$translate) {

    var msg = this;
    msg.messages          = MessageserviceResolve.messages;
    msg.msgtotalItem      = MessageserviceResolve.count.length;
    msg.currentPage       = 1;
    msg.msgitemsPerPage   = 2;

	  msg.messages1 = msg.messages.filter(function (value) {
		if (value.task) {
			return value;
		}
	}).map(function (value) {
		  return value;
    });



    msg.currentusertype = CurrentuserResolve.user_type;


  	msg.currentuserid   = CurrentuserResolve.user_id;

    msg.deletemessage   = function (taskid,userid,taskerid,currentpage) {
	console.log("currentPage",currentpage)
    var ids = {};
		ids.taskid = taskid;
		ids.userid = userid;
		ids.taskerid = taskerid;
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'app/site/modules/messages/views/deletemessage.modal.tab.html',
			controller: 'deletemessageCtrl',
			controllerAs: 'DACM',
			resolve: {
				idinfo: function () {
					return ids;
				}
			}
		});
		modalInstance.result.then(function (idinfo) {
			MessageService.deleteConversation(idinfo,msg.currentusertype).then(function (response) {
        $translate('MESSAGE DELETED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
			//	toastr.success("Message Deleted Successfully");
				MessageService.getMessage(msg.currentuserid, msg.currentusertype,0,3).then(function (response) {
					msg.messages = response.messages;
					msg.messages1 = msg.messages.filter(function (value) {
						if (value.task) {
							return value;
							console.log("returnvalue",value)
						}
					}).map(function (value) {
						return value;
					});
					msg.getMessage(currentpage);
				}, function () {

				});
			}, function () {
			});
		}, function () { });
	};


  msg.msgitemsPerPage   = 3;
  msg.getMessage = function getMessage(page) {
  console.log("page",page)
	 page = (page-1)*msg.msgitemsPerPage;
	 MessageService.getMessage(msg.currentuserid, msg.currentusertype,page,msg.msgitemsPerPage).then(function (response) {
			if (response) {
        msg.messages          = response.messages;
        msg.msgtotalItem      = response.count.length;
    	  msg.messages1 = msg.messages.filter(function (value) {
    		if (value.task) {
    			return value;
    		}
    	  }).map(function (value) {
    		  return value;
        });
			}
			//acc.getTaskDetailsByStausResponse = true;
		});
	}



}

angular.module('quickRabbit.messages').controller('deletemessageCtrl', function ($uibModalInstance, idinfo) {
	var dacm = this;
	idinfo.from = idinfo.from;
	idinfo.to = idinfo.to;

	dacm.ok = function () {
		$uibModalInstance.close(idinfo);
	};

	dacm.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

});
