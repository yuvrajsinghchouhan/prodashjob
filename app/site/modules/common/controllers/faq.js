angular.module('quickRabbit.faq')
    .controller('faqCtrl',faqCtrl);

faqCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', 'FaqserviceResolve', 'FaqService', '$state','$sce','$translate'];

function faqCtrl($scope, $rootScope, $location, $stateParams, FaqserviceResolve, FaqService, $state,$sce,$translate) {

	var fac = this;
	fac.data = FaqserviceResolve;


$scope.oneAtATime = true;



}

