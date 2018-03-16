angular.module('quickRabbit.category')
    .controller('categoryCtrl', categoryCtrl);

categoryCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', 'CategoryserviceResolve', 'CategoryService', '$state', '$translate', 'ngMeta'];
function categoryCtrl($scope, $rootScope, $location, $stateParams, CategoryserviceResolve, CategoryService, $state, $translate, ngMeta) {
	var cac = this;
	cac.data = CategoryserviceResolve;
	cac.itemsPerPage = 6;
	cac.currentPage = 1;
	cac.totalItems = 0;

	cac.categoryDatails = cac.data.response.ActiveCategory.parentcategory;
	cac.subcategory = cac.data.response.ActiveCategory.subcategory;
	cac.totalItems = cac.data.response.ActiveCategory.totalsubcategory;

	if (cac.categoryDatails.name) {
		ngMeta.setTitle(cac.categoryDatails.name);
	}

	cac.getSubcategoryResponse = true;

	cac.getSubcategory = function () {
		cac.subcategory = [];
		if (angular.isDefined(cac.categoryDatails._id)) {
			cac.getSubcategoryResponse = false;
			CategoryService.getcategory(cac.categoryDatails.slug, cac.currentPage, cac.itemsPerPage).then(function (data) {
				if (data.response.ActiveCategory.subcategory.length > 0) {
					cac.subcategory = data.response.ActiveCategory.subcategory;
					cac.totalItems = data.response.ActiveCategory.totalsubcategory;
				}
			}, function (error) {
			});
		}
	};
}
