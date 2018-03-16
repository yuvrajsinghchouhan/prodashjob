angular.module('quickRabbit.page')
    .controller('pagesCtrl', pagesCtrl);

pagesCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', 'PagesserviceResolve', 'PageService', '$state', '$sce', '$translate', 'ngMeta','$cookies'];
function pagesCtrl($scope, $rootScope, $location, $stateParams, PagesserviceResolve, PageService, $state, $sce, $translate, ngMeta, $cookies) {
	var pac = this;
	if (PagesserviceResolve.seo) {
		ngMeta.setTitle(PagesserviceResolve.seo.title);
		ngMeta.setTag('description', PagesserviceResolve.seo.description);
		ngMeta.setTag('keyword', PagesserviceResolve.seo.keyword);
	}
	console.log("PagesserviceResolve",PagesserviceResolve);
	if(PagesserviceResolve[0].parent){
		$rootScope.pageId = PagesserviceResolve[0].parent;
	}else{
		$rootScope.pageId = PagesserviceResolve[0]._id;
	}
	if (PagesserviceResolve[0]) {
		pac.data = PagesserviceResolve[0];
	} else {
		$state.go('404');
		return;
	}
	$scope.html = pac.data.description;
	$rootScope.trustedHtml = $sce.trustAsHtml($scope.html);
	pac.getSubcategoryResponse = true;
	pac.getSubcategory = function () {
		pac.subcategory = [];
		if (angular.isDefined(pac.categoryDatails._id)) {
			pac.getSubcategoryResponse = false;
			PageService.getcategory(pac.categoryDatails.slug, pac.currentPage, pac.itemsPerPage).then(function (data) {
				if (data.response.ActiveCategory.subcategory.length > 0) {
					pac.subcategory = data.response.ActiveCategory.subcategory;

					pac.totalItems = data.response.ActiveCategory.totalsubcategory;
				}
			}, function (error) {
			});
		}
	};
}
