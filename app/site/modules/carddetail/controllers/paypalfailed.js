angular.module('quickRabbit.category')
	.controller('paypalfaileddetailCtrl', paypalfaileddetailCtrl);

paypalfaileddetailCtrl.$inject = ['$scope', '$rootScope', '$window', '$stateParams', '$state', 'paypaltaskid'];
function paypalfaileddetailCtrl($scope, $rootScope, $window, $stateParams, $state, paypaltaskid) {
	var ppdc = this;
	ppdc.taskid = paypaltaskid.task;
}
