'use strict';

// Angular Module's
angular.module('Authentication', []);
angular.module('quickRabbit.administrator', []);
angular.module('quickRabbit.users', []);
angular.module('quickRabbit.taskers', []);
angular.module('quickRabbit.dashboard', []);
angular.module('quickRabbit.pages', []);
angular.module('quickRabbit.sliders', []);
angular.module('quickRabbit.coupons', []);
angular.module('quickRabbit.emailTemplate', []);
angular.module('quickRabbit.categories', []);
angular.module('quickRabbit.faq', []);
angular.module('quickRabbit.experience', []);
angular.module('quickRabbit.question', []);
angular.module('quickRabbit.reviews', []);
angular.module('quickRabbit.settings', []);
angular.module('quickRabbit.languages', []);
angular.module('quickRabbit.currencies', []);
angular.module('quickRabbit.tools', []);
angular.module('quickRabbit.newsletter', []);
angular.module('quickRabbit.pushnotification', []);
angular.module('quickRabbit.postheader', []);
angular.module('quickRabbit.paymentGateway', []);
angular.module('quickRabbit.postfooter', []);
angular.module('quickRabbit.images', []);
angular.module('quickRabbit.contactus', []);
angular.module('quickRabbit.tasks', []);
angular.module('quickRabbit.earnings', []);
angular.module('quickRabbit.cancellation', []);

angular.module('quickRabbit.admin', [
    'Authentication',
    'angular-loading-bar',
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ui.bootstrap',
    'ui.router',
    'ui.utils',
    'ui.tinymce',
    'toastr',
    'pascalprecht.translate',
    'picardy.fontawesome',
    'ui.select',
    'ui.tree',
    'ngImgCrop',
    'ngMap',
    'ngIntlTelInput',
    'ngTagsInput',
    'ngFileUpload',
    'slugifier',
    'angular-flot',
    'easypiechart',
    'checklist-model',
    'quickRabbit.dashboard',
    'quickRabbit.administrator',
    'quickRabbit.users',
    'quickRabbit.taskers',
    'quickRabbit.pages',
    'quickRabbit.sliders',
    'quickRabbit.coupons',
    'quickRabbit.emailTemplate',
    'quickRabbit.categories',
    'quickRabbit.faq',
    'quickRabbit.experience',
    'quickRabbit.question',
    'quickRabbit.reviews',
    'quickRabbit.settings',
    'quickRabbit.languages',
    'quickRabbit.currencies',
    'quickRabbit.tools',
    'quickRabbit.newsletter',
    'quickRabbit.pushnotification',
    'quickRabbit.postheader',
    'quickRabbit.paymentGateway',
    'quickRabbit.postfooter',
    'quickRabbit.images',
    'quickRabbit.contactus',
    'quickRabbit.tasks',
    'quickRabbit.earnings',
    'quickRabbit.cancellation'
]);

angular.module('quickRabbit.admin')
    .run(['$rootScope', '$state', '$location', '$cookieStore', '$http', '$stateParams', 'MainService', 'AuthenticationService', '$modalStack', function ($rootScope, $state, $location, $cookieStore, $http, $stateParams, MainService, AuthenticationService, $modalStack) {
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = $rootScope.globals.currentUser.authdata;

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toParams;
                $rootScope.userPrivilages = MainService.getCurrentUserValue();

                if ($rootScope.userPrivilages) {
                    if ($rootScope.userPrivilages.privileges && $rootScope.userPrivilages.role != 'admin' && toState.name != 'app.dashboard') {
                        var path = toState.name.split(".");
                        var parent = path[0] + "." + path[1];
                        var action = toState.action;

                        $rootScope.userPrivilages.privileges.filter(function (childs) {
                            if ((childs.state == parent || childs.state == toState.name) && (childs.status[toState.action] == false || (toState.action == 'all' && childs.status['delete'] == false && childs.status['edit'] == false && childs.status['add'] == false && childs.status['view'] == false))) {
                                if (!path[2]) {
                                    if (childs.state == toState.name) {
                                        event.preventDefault();
                                        $state.go("app.dashboard");
                                    }
                                } else {
                                    if (childs.childs) {
                                        childs.childs.filter(function (menu, index, arr) {
                                            if (menu.state == toState.name && (menu.action == toState.action || (toState.action == 'all' && childs.status['delete'] == false && childs.status['edit'] == false && childs.status['add'] == false && childs.status['view'] == false))) {
                                                event.preventDefault();
                                                $state.go("app.dashboard");
                                            } else if (childs.state == parent && (menu.action == toState.action || (childs.status['delete'] == false && childs.status['edit'] == false && childs.status['add'] == false && childs.status['view'] == false))) {
                                                event.preventDefault();
                                                $state.go("app.dashboard");
                                            }
                                        });
                                    } else {
                                        if (childs.state == toState.name && (childs.action == toState.action || (toState.action == 'all' && childs.status['delete'] == false && childs.status['edit'] == false && childs.status['add'] == false && childs.status['view'] == false))) {
                                            event.preventDefault();
                                            $state.go("app.dashboard");
                                        } else if (childs.state == parent && (childs.action == toState.action || (childs.status['delete'] == false && childs.status['edit'] == false && childs.status['add'] == false && childs.status['view'] == false))) {
                                            event.preventDefault();
                                            $state.go("app.dashboard");
                                        }
                                    }
                                }
                            } else {
                                if (childs.state == parent && (childs.status['delete'] == false && childs.status['edit'] == false && childs.status['add'] == false && childs.status['view'] == false)) {
                                    event.preventDefault();
                                    $state.go("app.dashboard");
                                }
                            }
                        });
                    }
                }
            });
        } else {
            $location.path('/login');
        }
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (toState.name !== 'login' && toState.name !== 'forgotpwdadmin' && toState.name !== 'forgotpwdadminmail' && !$rootScope.globals.currentUser) {
                AuthenticationService.ClearCredentials();
                $location.path('/login');
            }
        });

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            $modalStack.dismissAll();
            event.targetScope.$watch('$viewContentLoaded', function () {
                angular.element('html, body, #content')
                    .animate({
                        scrollTop: 0
                    }, 200);
                setTimeout(function () {
                    angular.element('#wrap')
                        .css('visibility', 'visible');
                    if (!angular.element('.dropdown')
                        .hasClass('open')) {
                        angular.element('.dropdown')
                            .find('>ul');
                        // .slideUp();
                    }
                }, 200);
            });
            $rootScope.containerClass = toState.containerClass;
        });
    }])
    .factory('myHttpInterceptor', function ($location, $rootScope) {
        var timestampMarker = {
            response: function (response) {
                $rootScope.imgSrc = false;
                if (response.data == 'wrong') {
                    $location.path('/login');
                }
                if (response.status == 404) {
                    $location.path('/404');
                }
                return response;
            },
            request: function (config) {
                $rootScope.imgSrc = true;
                return config || $q.when(config);
            }
        };
        return timestampMarker;
    })
    .config(function ($provide) {

        $provide.provider('menuProvider', function () {
            this.$get = function ($http, $q) {
                return {
                    menu: function (user) {
                        var deferred = $q.defer();
                        $http.get('app/admin/public/asserts/json/menu.json').success(function (data) {
                            if (user) {
                                if (user.privileges && user.role != 'admin') {
                                    for (var j = 0; j < data.length; j++) {
                                        user.privileges.filter(function (childs) {
                                            if (childs.state == data[j].state) {
                                                if (childs.status.view == false && childs.status.add == false && childs.status.edit == false && childs.status.delete == false) {
                                                    data.splice(j, 1);
                                                } else if (data[j].childs) {
                                                    data[j].childs.filter(function (menu, index, arr) {
                                                        if (childs.status.view == false && menu.action == 'view') {
                                                            if (data[j].childs[index].state == menu.state) { data[j].childs.splice(index, 1); }
                                                        } else if (childs.status.add == false && menu.action == 'add') {
                                                            if (data[j].childs[index].state == menu.state) { data[j].childs.splice(index, 1); }
                                                        } else if (childs.status.edit == false && menu.action == 'edit') {
                                                            if (data[j].childs[index].state == menu.state) { data[j].childs.splice(index, 1); }
                                                        } else if (childs.status.delete == false && menu.action == 'delete') {
                                                            if (data[j].childs[index].state == menu.state) { data[j].childs.splice(index, 1); }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                            user.menu = data;
                            deferred.resolve(user);
                        }).error(function (err) {
                            deferred.reject(err);
                        });
                        return deferred.promise;
                    }
                };
            };
        });
    })
    .config(['$translateProvider', '$urlMatcherFactoryProvider', function ($translateProvider, $urlMatcherFactoryProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '/app/admin/public/asserts/languages/',
            suffix: '.json'
        });
        //$translateProvider.useLocalStorage();
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy(null);
        $urlMatcherFactoryProvider.caseInsensitive(false);
        $urlMatcherFactoryProvider.strictMode(true);
    }])
    .config(function ($provide) {
        $provide.decorator('$state', function ($delegate) {
            var state = $delegate;
            state.baseGo = state.go;
            var go = function (to, params, options) {
                options = options || {};
                options.inherit = false;
                this.baseGo(to, params, options);
            };
            state.go = go;
            return $delegate;
        });
    })
    .config(function (ngIntlTelInputProvider) {
        ngIntlTelInputProvider.set({ defaultCountry: 'us' });
    })
    .config(function (toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: true,
            maxOpened: 1,
            tapToDismiss: true,
            closeButton: true,
            closeHtml: '<i class="fa fa-times"></i>'
        });
    })
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$urlMatcherFactoryProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $urlMatcherFactoryProvider) {
        $httpProvider.interceptors.push('myHttpInterceptor');
        $urlMatcherFactoryProvider.defaultSquashPolicy(true);
        $urlRouterProvider.rule(function ($injector, $location) {
            var path = $location.path();
            var hasTrailingSlash = path[path.length - 1] === '/';
            if (hasTrailingSlash) {
                var newPath = path.substr(0, path.length - 1);
                return newPath;
            }
        });
        $urlRouterProvider.otherwise('/app/dashboard');
        $stateProvider
            .state('login', {
                url: '/login',
                controller: 'LoginController',
                templateUrl: 'app/admin/modules/users/views/login.html'
            })
            .state('logout', {
                url: '/logout',
                controller: 'LogoutController'
            })

            .state('forgotpwdadmin', {
                url: '/forget-admin',
                controller: 'adminsforgtCtrl',
                controllerAs: 'AFC',
                templateUrl: 'app/admin/modules/users/views/forgetpwd.html',
            })

            .state('forgotpwdadminmail', {
                url: '/forgotpwdadminmail/:userid',
                controller: "adminsmailforgtCtrl",
                controllerAs: 'AFMC',
                templateUrl: "app/admin/modules/users/views/mailforgetpwd.html",
            })

            .state('app', {
                abstract: true,
                url: '/app',
                controller: "MainCtrl",
                controllerAs: 'MAC',
                templateUrl: 'app/admin/modules/common/views/app.html',
                resolve: {
                    MainResolve: function (MainService, menuProvider, $cookieStore) {
                        var cookieStore = $cookieStore.get('globals');
                        if (cookieStore) {
                            return MainService.getCurrentUsers(cookieStore.currentUser.username).then(function (data) {
                                MainService.setCurrentUserValue(data[0]);
                                return menuProvider.menu(data[0]);
                            });
                        } else {
                            return false;
                        }
                    }
                }
            })
            .state('app.dashboard', {
                url: '/dashboard',
                action: 'all',
                controller: 'DashboardCtrl',
                controllerAs: 'DLC',
                templateUrl: 'app/admin/modules/dashboard/views/dashboard.html',
                resolve: {
                    userCountServiceResolve: function (DashboardService) {
                        return DashboardService.getAllUsers(0, 10, 0);
                    },
                    getRecentTaskersResolve: function (DashboardService) {
                        return DashboardService.getRecentTaskers();
                    },
                    getRecentTasksResolve: function (DashboardService) {
                        return DashboardService.getRecentTasks(10, 0);
                    },
                    getRecentUsersResolve: function (DashboardService) {
                        return DashboardService.getRecentUsers();
                    },
                    TasksServiceResolve: function (TasksService) {
                        return TasksService.getTasksList(0);
                    },
                    earningsServiceResolve: function (DashboardService) {
                        return DashboardService.earningsDetails();
                    }
                }

            })
            .state('app.admins', {
                url: '/admins',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.admins.list', {
                url: '/list-admin',
                action: 'all',
                controller: 'adminsListCtrl',
                controllerAs: 'ALC',
                templateUrl: 'app/admin/modules/administrators/views/list_admin.html',
                resolve: {
                    adminsServiceResolve: function (AdminsService) {
                        return AdminsService.getAllAdmins();
                    }
                }
            })
            .state('app.admins.sub', {
                url: '/sub',
                action: 'all',
                controller: 'subAdminsListCtrl',
                controllerAs: 'SALC',
                templateUrl: 'app/admin/modules/administrators/views/sub-admin-list.html',
                resolve: {
                    subAdminsServiceResolve: function (AdminsService) {
                        return AdminsService.getAllSubAdmins();
                    }
                }
            })
            .state('app.admins.add', {
                url: '/add-admin/:id',
                action: 'add',
                controller: 'adminAddCtrl',
                controllerAs: 'ADAC',
                templateUrl: 'app/admin/modules/administrators/views/add_admin.html',
                resolve: {
                    adminsEditServiceResolve: function (AdminsService, $stateParams) {
                        return AdminsService.edit($stateParams.id);
                    }
                }
            })
            .state('app.admins.subadd', {
                url: '/add-sub/:id',
                action: 'add',
                controller: 'subAdminCtrl',
                controllerAs: 'ROMC',
                templateUrl: 'app/admin/modules/administrators/views/role_manager.html',
                resolve: {
                    roleManagerResolve: function (RoleManagerService) {
                        return RoleManagerService.getMenuList();
                    },
                    userRoleResolve: function (RoleManagerService, $stateParams) {
                        return RoleManagerService.getAllUsersRole($stateParams.id);
                    }
                }
            })
            .state('app.users', {
                url: '/users',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.users.add', {
                url: '/add-user/:id',
                action: 'add',
                controller: 'userAddCtrl',
                controllerAs: 'USAC',
                templateUrl: 'app/admin/modules/users/views/add_user.html',
                resolve: {
                    usersEditServiceResolve: function (UsersService, $stateParams) {
                        return UsersService.edit($stateParams.id);
                    }
                }
            })
            .state('app.users.list', {
                url: '/list-user',
                action: 'all',
                controller: 'usersListCtrl',
                controllerAs: 'USLC',
                templateUrl: 'app/admin/modules/users/views/list_user.html',
                resolve: {
                    usersServiceResolve: function (UsersService) {
                        return UsersService.getAllUsers(0, 10, 0);
                    }
                }
            })
            .state('app.users.transactionslist', {
                url: '/transactionlist-user/:id',
                action: 'all',
                controller: 'transactionListCtrl',
                controllerAs: 'TRLC',
                templateUrl: 'app/admin/modules/users/views/transactionlist_user.html',
                resolve: {
                    usersTransactionServiceResolve: function (UsersService, $stateParams) {
                        return UsersService.transactionsList($stateParams.id, 10, 0);
                    }
                }
            })
            .state('app.users.deleteduser', {
                url: '/deleteduser',
                action: 'all',
                controller: 'trashUserListCtrl',
                controllerAs: 'TULC',
                templateUrl: 'app/admin/modules/users/views/deleted_user.html',
                resolve: {
                    trashUserServiceResolve: function (UsersService) {
                        return UsersService.deleteuserList(10, 0);
                    }
                }
            })
            .state('app.taskers', {
                url: '/taskers',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.taskers.list', {
                url: '/list-tasker',
                action: 'all',
                controller: 'taskersListCtrl',
                controllerAs: 'TSLC',
                templateUrl: 'app/admin/modules/taskers/views/list_tasker.html',
                resolve: {
                    taskersServiceResolve: function (TaskersService) {
                        return TaskersService.getAllTaskers(0, 10, 0);
                    }
                }
            })
            .state('app.taskers.add', {
                url: '/add-new-tasker/:id',
                action: 'add',
                controller: 'addNewTaskerCtrl',
                controllerAs: 'ANTSC',
                templateUrl: 'app/admin/modules/taskers/views/add_new_tasker.html',
                resolve: {
                    taskerAddServiceResolve: function (TaskersService, $stateParams) {
                        return TaskersService.edit($stateParams.id);
                    },
                    CategoryServiceResolve: function (CategoryService) {
                        return CategoryService.getCategoryList();
                    }
                }
            })
            .state('app.taskers.edit', {
                url: '/add-tasker/:id',
                action: 'add',
                controller: 'addTaskerCtrl',
                controllerAs: 'ATSC',
                templateUrl: 'app/admin/modules/taskers/views/edit_tasker.html',
                resolve: {
                    taskerAddServiceResolve: function (TaskersService, $stateParams) {
                        return TaskersService.edit($stateParams.id);
                    },
                    CategoryServiceResolve: function (CategoryService) {
                        return CategoryService.getCategoryList();
                    }
                }
            })

            .state('app.taskers.delete', {
                url: '/deleted-taskers',
                action: 'all',
                controller: 'deletedTaskerCtrl',
                controllerAs: 'DTSL',
                templateUrl: 'app/admin/modules/taskers/views/deletedTasker_list.html',
                resolve: {
                    deletedtaskersServiceResolve: function (TaskersService) {
                        return TaskersService.getDeletedTaskers(0, 10, 0);
                    }
                }
            })

            .state('app.pages', {
                url: '/pages',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.pages.list', {
                url: '/list',
                action: 'all',
                controller: 'pagesListCtrl',
                controllerAs: 'PLC',
                templateUrl: 'app/admin/modules/pages/views/pages_list.html',
                resolve: {
                    PageListServiceResolve: function (PageService) {
                        return PageService.getPageList(10, 0);
                    }
                }
            })
            .state('app.pages.action', {
                url: '/edit?id',
                action: 'add',
                controller: 'editPageCtrl',
                controllerAs: 'EDPC',
                templateUrl: 'app/admin/modules/pages/views/edit_page.html',
                resolve: {
                    PageServiceResolve: function (PageService, $stateParams) {
                        return PageService.editPageCall($stateParams.id);
                    }
                }
            })
            .state('app.pages.edittranslate', {
                url: '/edittranslate?id',
                action: 'list',
                controller: 'editPageLanguageCtrl',
                controllerAs: 'EDPLC',
                templateUrl: 'app/admin/modules/pages/views/edit_translate_page.html',
                resolve: {
                    PageTranslateServiceResolve: function (PageService) {
                        return PageService.translatelanguage();
                    },
                    SubPageServiceResolve: function (PageService, $stateParams) {
                        return PageService.editPageCall($stateParams.id);
                    }
                }
            })
            .state('app.pages.subpageslist', {
                url: '/sublist/:id',
                action: 'add',
                controller: 'subPagesListCtrl',
                controllerAs: 'SPLC',
                templateUrl: 'app/admin/modules/pages/views/sub_page_list.html',
                resolve: {
                    SubPageListServiceResolve: function (PageService, $stateParams) {
                        return PageService.getSubPageList($stateParams.id, 10, 0);
                    }
                }
            })
            .state('app.sliders', {
                url: '/slider',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.sliders.viewsSlider', {
                url: '/view-slider',
                action: 'all',
                controller: 'viewSliderCtrl',
                controllerAs: 'VSC',
                templateUrl: 'app/admin/modules/slider/views/viewSlider.html',
                resolve: {
                    SliderServiceResolve: function (MainService, SliderService) {
                        return SliderService.getSliderList(10, 0);
                    }
                }

            })
            .state('app.sliders.add', {
                url: '/add/:id',
                action: 'add',
                controller: 'editSliderCtrl',
                controllerAs: 'EDSC',
                templateUrl: 'app/admin/modules/slider/views/editSlider.html',
                resolve: {
                    sliderEditReslove: function ($stateParams, SliderService) {
                        return SliderService.getSlider($stateParams.id);
                    }
                }
            })
            .state('app.contact', {
                url: '/contact',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.contact.view', {
                url: '/view-contact',
                action: 'all',
                controller: 'viewContactCtrl',
                controllerAs: 'VSCC',
                templateUrl: 'app/admin/modules/contact-us/views/viewContactUs.html',
                resolve: {
                    ContactServiceResolve: function (MainService, ContactService) {
                        return ContactService.getContactList(10, 0);
                    }
                }

            })
            .state('app.contact.add', {
                url: '/add/:id',
                action: 'add',
                controller: 'editContactCtrl',
                controllerAs: 'EDCC',
                templateUrl: 'app/admin/modules/contact-us/views/editContactUs.html',
                resolve: {
                    contactEditReslove: function ($stateParams, ContactService) {
                        return ContactService.getContact($stateParams.id);
                    }
                }
            })
            .state('app.images', {
                url: '/images',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.images.imagelist', {
                url: '/imagelist',
                action: 'all',
                controller: 'viewImagesCtrl',
                controllerAs: 'VIC',
                templateUrl: 'app/admin/modules/images/views/viewImages.html',
                resolve: {
                    ImagesServiceResolve: function (MainService, ImagesService) {
                        return ImagesService.getImagesList(10, 0);
                    }
                }
            })
            .state('app.images.addimage', {
                url: '/addimage/:id',
                // action: 'add',
                controller: 'editImagesCtrl',
                controllerAs: 'EDIC',
                templateUrl: 'app/admin/modules/images/views/editImages.html',
                resolve: {
                    imagesEditReslove: function ($stateParams, ImagesService) {
                        return ImagesService.getImage($stateParams.id);
                    }
                }
            })
            .state('app.emailtemplate', {
                url: '/email-template',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.emailtemplate.list', {
                url: '/list',
                action: 'all',
                controller: 'emailTemplateListCtrl',
                controllerAs: 'ETL',
                templateUrl: 'app/admin/modules/email-template/views/email_template_list.html',
                resolve: {
                    emailTemplateListResolve: function (EmailTemplateService) {
                        return EmailTemplateService.getTemplateList(10, 0);
                    }
                }
            })
            .state('app.emailtemplate.action', {
                url: '/:action/:id',
                action: 'add',
                controller: 'emailTemplateSaveCtrl',
                controllerAs: 'EETC',
                templateUrl: 'app/admin/modules/email-template/views/email_template_add_edit.html',
                resolve: {
                    emailTemplateEditResolve: function (EmailTemplateService, $stateParams) {
                        if ($stateParams.id) {
                            return EmailTemplateService.getTemplate($stateParams.id);
                        } else {
                            return EmailTemplateService.getTemplate();
                        }
                    }
                }
            })
            .state('app.categories', {
                url: '/category',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.categories.list', {
                url: '/category-list',
                action: 'all',
                controller: 'categoryListCtrl',
                controllerAs: 'VCL',
                templateUrl: '/app/admin/modules/categories/views/categoryList.html',
                resolve: {
                    CategoryServiceResolve: function (MainService, CategoryService) {
                        return CategoryService.getCategoryList(15, 0);
                    }
                }
            })
            .state('app.categories.edit', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editCategoryCtrl',
                controllerAs: 'ECATC',
                templateUrl: 'app/admin/modules/categories/views/addEditCategory.html',
                resolve: {
                    categoryEditReslove: function (CategoryService, $stateParams) {
                        if ($stateParams.id) {
                            return CategoryService.getCategory($stateParams.id);
                        } else {
                            return CategoryService.getCategory();
                        }
                    }
                }
            })
            .state('app.categories.subcategorylist', {
                url: '/subcategory-list',
                action: 'all',
                controller: 'subcategoryListCtrl',
                controllerAs: 'VSCL',
                templateUrl: 'app/admin/modules/categories/views/subcategoryList.html',
                resolve: {
                    CategoryServiceResolve: function (MainService, CategoryService) {
                        return CategoryService.getsubCategoryList(15, 0);
                    }
                }
            })

            .state('app.categories.sub', {
                url: '/subedit/:id',
                action: 'add',
                controller: 'editsubCategoryCtrl',
                controllerAs: 'ESCATC',
                templateUrl: 'app/admin/modules/categories/views/addEditsubCategory.html',
                resolve: {
                    categoryEditReslove: function (CategoryService, $stateParams) {
                        if ($stateParams.id) {
                            return CategoryService.getsubCategory($stateParams.id);
                        } else {
                            return CategoryService.getsubCategory();
                        }
                    }
                }
            })
            .state('app.faq', {
                url: '/faq',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.faq.list', {
                url: '/faq-list',
                action: 'all',
                controller: 'faqListCtrl',
                controllerAs: 'FLC',
                templateUrl: 'app/admin/modules/faq/views/faqList.html',
                resolve: {
                    FaqServiceResolve: function (MainService, FaqService) {
                        return FaqService.getFaqList(10, 0);
                    }
                }
            })
            .state('app.faq.edit', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editFaqCtrl',
                controllerAs: 'EFC',
                templateUrl: 'app/admin/modules/faq/views/addEditFaq.html',
                resolve: {
                    faqEditReslove: function (FaqService, $stateParams) {
                        return FaqService.getFaq($stateParams.id);
                    }
                }
            })
            .state('app.tasker_management', {
                url: '/tasker_management',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.tasker_management.experience', {
                url: '/experience',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.tasker_management.experience.list', {
                url: '/list',
                action: 'all',
                controller: 'experienceListCtrl',
                controllerAs: 'EPL',
                templateUrl: 'app/admin/modules/experience/views/experience-list.html',
                resolve: {
                    experienceServiceResolve: function (ExperienceService) {
                        return ExperienceService.getExperienceList(10, 0);
                    }
                }
            })
            .state('app.tasker_management.experience.edit', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editExperienceCtrl',
                controllerAs: 'EEC',
                templateUrl: 'app/admin/modules/experience/views/add-edit-experience.html',
                resolve: {
                    ExperienceEditReslove: function (ExperienceService, $stateParams) {
                        if ($stateParams.id) {
                            return ExperienceService.getExperience($stateParams.id);
                        } else {
                            return ExperienceService.getExperience();
                        }
                    }
                }
            })
            .state('app.tasker_management.question', {
                url: '/question',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.tasker_management.question.viewsQuestion', {
                url: '/view-question',
                action: 'all',
                controller: 'viewQuestionCtrl',
                controllerAs: 'VQC',
                templateUrl: 'app/admin/modules/question-management/views/viewQuestionManagement.html',
                resolve: {
                    QuestionServiceResolve: function (QuestionService) {
                        return QuestionService.getQuestionList(10, 0);
                    }
                }
            })
            .state('app.tasker_management.question.add', {
                url: '/add/:id',
                action: 'add',
                controller: 'editQuestionerCtrl',
                controllerAs: 'EDQC',
                templateUrl: 'app/admin/modules/question-management/views/editQuestionManagement.html',
                resolve: {
                    QuestionEditReslove: function ($stateParams, QuestionService) {
                        return QuestionService.getQuestion($stateParams.id);
                    }
                }
            })
            .state('app.reviews', {
                url: '/reviews',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.reviews.list', {
                url: '/view-reviews',
                action: 'all',
                controller: 'viewReviewsCtrl',
                controllerAs: 'VRC',
                templateUrl: 'app/admin/modules/reviews/views/viewReviews.html',
                resolve: {
                    ReviewsServiceResolve: function (ReviewsService) {
                        return ReviewsService.getReviewsList('all', 10, 0);
                    }
                }
            })
            .state('app.reviews.action', {
                url: '/add/:id',
                action: 'add',
                controller: 'editReviewsCtrl',
                controllerAs: 'EDRC',
                templateUrl: 'app/admin/modules/reviews/views/editReviews.html',
                resolve: {
                    ReviewsEditReslove: function ($stateParams, ReviewsService) {
                        return ReviewsService.getReviews($stateParams.id);
                    }
                }
            })
            .state('app.tasks', {
                url: '/tasks',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.tasks.viewsTasks', {
                url: '/view-tasks',
                action: 'all',
                controller: 'viewTasksCtrl',
                controllerAs: 'VTC',
                templateUrl: 'app/admin/modules/tasks/views/viewTasks.html',
                resolve: {
                    TasksServiceResolve: function (TasksService) {
                        return TasksService.getTasksList(0, 10, 0);
                    }
                }
            })
            .state('app.tasks.add', {
                url: '/add/:id',
                action: 'add',
                controller: 'editTasksCtrl',
                controllerAs: 'EDTTC',
                templateUrl: 'app/admin/modules/tasks/views/editTasks.html',
                resolve: {
                    TasksEditReslove: function ($stateParams, TasksService) {
                        return TasksService.getTasks($stateParams.id);
                    }
                }
            })
            .state('app.tasks.delete', {
                url: '/deleteTasks',
                action: 'add',
                controller: 'deletedTasksCtrl',
                controllerAs: 'DTTC',
                templateUrl: 'app/admin/modules/tasks/views/deletedTasks.html',
                resolve: {
                    DeletedTasksServiceResolve: function (TasksService) {
                        return TasksService.getDeletedTasksList(0, 10, 0);
                    }
                }
            })
            .state('app.tasks.export', {
                action: 'all',
                controller: 'exportTasksCtrl',
                resolve: {
                    TasksExportReslove: function (TasksService) {
                        return TasksService.getTasksExport();
                    }
                }
            })
            .state('app.cancellation', {
                url: '/cancellation',
                action: 'all',
                template: '<div ui-view></div>',
            })
            .state('app.cancellation.list', {
                url: '/list',
                action: 'all',
                controller: 'cancellationCtrl',
                controllerAs: 'CAL',
                templateUrl: 'app/admin/modules/cancellation/views/cancellation.html',
                resolve: {
                    cancellationResolve: function (cancellationService) {
                        return cancellationService.getCancellationList(10, 0);
                    }
                }
            })
            .state('app.cancellation.edit', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editCancellationCtrl',
                controllerAs: 'ECAL',
                templateUrl: 'app/admin/modules/cancellation/views/editcancellation.html',
                resolve: {
                    editcancellationResolve: function ($stateParams, cancellationService) {
                        return cancellationService.getCancellation($stateParams.id);
                    }
                }
            })

            .state('app.earnings', {
                url: '/earnings',
                action: 'all',
                template: '<div ui-view></div>',
            })
            .state('app.earnings.list', {
                url: '/list',
                action: 'all',
                controller: 'earningsCtrl',
                controllerAs: 'ENC',
                templateUrl: 'app/admin/modules/earnings/views/earnings.html',
                resolve: {
                    EarningsServiceResolve: function (EarningService) {
                        return EarningService.getEarningList(10, 0, 'undefined', 'undefined');
                    },
                    TasksServiceResolve: function (EarningService) {
                        return EarningService.getfirsttask();
                    },
                    CycleServiceResolve: function (EarningService) {
                        return EarningService.getcyclelist();
                    },
                    FirstCycleServiceResolve: function (EarningService) {
                        return EarningService.getcyclefirst();
                    }
                }
            })
            .state('app.settings.mobileContent', {
                url: '/mobile-content',
                action: 'all',
                controller: 'mobileContentCtrl',
                controllerAs: 'MCC',
                templateUrl: 'app/admin/modules/settings/views/mobileContent.html',
                resolve: {
                    mobileSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getmobileSettings();
                    }
                }
            })
            .state('app.earnings.view', {
                url: '/view/:id/:cycle',
                action: 'add',
                controller: 'viewearningsCtrl',
                controllerAs: 'ENCC',
                templateUrl: 'app/admin/modules/earnings/views/editearning.html',
                resolve: {
                    TaskerEarningReslove: function ($stateParams, EarningService) {
                        var data = {};
                        data.tasker = $stateParams.id;
                        data.cycle = $stateParams.cycle;
                        return EarningService.getTaskrearning(data, 10, 0);
                    },
                    PaidEarningsServiceResolve: function ($stateParams, EarningService) {
                        var data = {};
                        data.tasker = $stateParams.id;
                        data.cycle = $stateParams.cycle;
                        return EarningService.paidserivce(data);
                    }
                }
            })
            .state('app.tools', {
                url: '/tools',
                action: 'all',
                controller: 'toolsCtrl',
                controllerAs: 'TSC',
                templateUrl: 'app/admin/modules/tools/views/tools.html'
            })
            .state('app.settings', {
                url: '/settings',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.settings.generalSettings', {
                url: '/general-settings',
                controller: 'generalSettingsCtrl',
                controllerAs: 'GSC',
                templateUrl: 'app/admin/modules/settings/views/general_settings.html',
                resolve: {
                    GeneralSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getGeneralSettings();
                    },
                    TimeZoneSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getTimeZoneSettings();
                    }
                }
            })
            .state('app.settings.seoSettings', {
                url: '/seo-settings',
                action: 'all',
                controller: 'seoSettingsCtrl',
                controllerAs: 'SSC',
                templateUrl: 'app/admin/modules/settings/views/seo_settings.html',
                resolve: {
                    SeoSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getSeoSettings();
                    }
                }
            })
            .state('app.settings.widgets', {
                url: '/widgets',
                action: 'all',
                controller: 'widgetsCtrl',
                controllerAs: 'WSC',
                templateUrl: 'app/admin/modules/settings/views/widgets.html',
                resolve: {
                    WidgetsServiceResolve: function (SettingsService) {
                        return SettingsService.getWidgets();
                    }
                }
            })
            .state('app.settings.smtpSettings', {
                url: '/smtp-settings',
                action: 'all',
                controller: 'smtpSettingsCtrl',
                controllerAs: 'SMTPSC',
                templateUrl: 'app/admin/modules/settings/views/smtp_settings.html',

                resolve: {
                    SMTPSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getSMTPSettings();
                    }
                }
            })
            .state('app.settings.SocialNetworksSettings', {
                url: '/social-networks',
                action: 'all',
                controller: 'SocialNetworksSettingsCtrl',
                controllerAs: 'SNSC',
                templateUrl: 'app/admin/modules/settings/views/social_networks.html',

                resolve: {
                    SocialNetworksSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getSocialNetworksSettings();
                    }
                }

            })
            .state('app.settings.currencySettings', {
                url: '/currency-settings',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.settings.currencySettings.list', {
                url: '/list',
                action: 'all',
                controller: 'currencySettingsListCtrl',
                controllerAs: 'CSLC',
                templateUrl: 'app/admin/modules/settings/views/currency/currency_list.html',
                resolve: {
                    CurrencyServiceResolve: function (CurrencyService) {
                        return CurrencyService.getProductList();
                    }
                }
            })
            .state('app.settings.currencySettings.add', {
                url: '/add/:id',
                action: 'add',
                controller: 'currencySettingsAddCtrl',
                controllerAs: 'CSAC',
                templateUrl: 'app/admin/modules/settings/views/currency/currency_add.html',
                resolve: {
                    currencyServiceResolve: function ($stateParams, CurrencyService) {
                        if ($stateParams.id) {
                            return CurrencyService.getCurrency($stateParams.id);
                        }
                    }
                }
            })
            .state('app.settings.languageSettings', {
                url: '/language-settings',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.settings.languageSettings.list', {
                url: '/list',
                action: 'all',
                controller: 'languageSettingsListCtrl',
                controllerAs: 'LSLC',
                templateUrl: 'app/admin/modules/settings/views/language/language_list.html',
                resolve: {
                    languageServiceListResolve: function (languageService) {
                        return languageService.getLanguageList(10, 0);
                    }
                }

            })
            .state('app.settings.languageSettings.manage', {
                url: '/manage/:langId',
                action: 'all',
                controller: 'languageSettingsManageCtrl',
                controllerAs: 'LSMC',
                templateUrl: 'app/admin/modules/settings/views/language/language_manage.html',
                resolve: {
                    languageServiceManageResolve: function (languageService, $stateParams) {
                        return languageService.managelanguage($stateParams.langId, 1, 10);
                    }
                }

            })
            .state('app.settings.languageSettings.action', {
                url: '/edit/:id',
                action: 'add',
                controller: 'languageSettingsEditCtrl',
                controllerAs: 'LSEC',
                templateUrl: 'app/admin/modules/settings/views/language/language_edit.html',
                resolve: {
                    languageServiceResolve: function (languageService, $stateParams) {
                        if ($stateParams.id) {
                            return languageService.getLanguage($stateParams.id);
                        } else {
                            return languageService.getLanguage();
                        }
                    }
                }

            })
            .state('app.settings.smssettings', {
                url: '/sms-settings',
                action: 'all',
                controller: 'smsSettingsCtrl',
                controllerAs: 'SMSC',
                templateUrl: 'app/admin/modules/settings/views/sms_settings.html',
                resolve: {
                    SMSSettingsServiceResolve: function (SettingsService) {
                        return SettingsService.getSMSSettings();
                    }
                }

            })
            .state('app.settings.cancellation', {
                url: '/cancellation',
                action: 'all',
                template: '<div ui-view></div>',
            })
            .state('app.settings.cancellation.list', {
                url: '/list',
                action: 'all',
                controller: 'cancellationCtrl',
                controllerAs: 'CAL',
                templateUrl: 'app/admin/modules/cancellation/views/cancellation.html',
                resolve: {
                    cancellationResolve: function (cancellationService) {
                        return cancellationService.getCancellationList(10, 0);
                    }
                }
            })
            .state('app.settings.cancellation.edit', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editCancellationCtrl',
                controllerAs: 'ECAL',
                templateUrl: 'app/admin/modules/cancellation/views/editcancellation.html',
                resolve: {
                    editcancellationResolve: function ($stateParams, cancellationService) {
                        return cancellationService.getCancellation($stateParams.id);
                    }
                }
            })
            .state('app.settings.images', {
                url: '/images',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.settings.images.imagelist', {
                url: '/imagelist',
                action: 'all',
                controller: 'viewImagesCtrl',
                controllerAs: 'VIC',
                templateUrl: 'app/admin/modules/images/views/viewImages.html',
                resolve: {
                    ImagesServiceResolve: function (MainService, ImagesService) {
                        return ImagesService.getImagesList(10, 0);
                    }
                }
            })
            .state('app.settings.images.addimage', {
                url: '/addimage/:id',
                // action: 'add',
                controller: 'editImagesCtrl',
                controllerAs: 'EDIC',
                templateUrl: 'app/admin/modules/images/views/editImages.html',
                resolve: {
                    imagesEditReslove: function ($stateParams, ImagesService) {
                        return ImagesService.getImage($stateParams.id);
                    }
                }
            })
            .state('app.newsletter', {
                url: '/newsletter',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.newsletter.subscriber', {
                url: '/list',
                action: 'all',
                controller: 'SubscriberListCtrl',
                controllerAs: 'ETLC',
                templateUrl: 'app/admin/modules/newsletter/views/subscriber_list.html',
                resolve: {
                    SubscriberServiceResolve: function (SubscriberService) {
                        return SubscriberService.getSubscriberList();
                    },
                    SubscriberMail: function (SubscriberService) {
                        return SubscriberService.getsubscripermail();
                    }
                }
            })
            .state('app.pushnotifications', {
                url: '/pushnotifications',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.pushnotifications.user', {
                url: '/user',
                action: 'all',
                controller: 'UserListCtrl',
                controllerAs: 'ULC',
                templateUrl: 'app/admin/modules/pushnotification/views/user_list.html',
                resolve: {
                    UsernotificationServiceResolve: function (UsernotificationService) {
                        return UsernotificationService.getUserList();
                    },
                    emailEditReslove: function (emailService) {
                        return emailService.getmailtemplate();
                    },
                    messageEditReslove: function (emailService) {
                        return emailService.getmessagetemplate();
                    }
                }
            })
            .state('app.pushnotifications.tasker', {
                url: '/tasker',
                action: 'all',
                controller: 'TaskerListCtrl',
                controllerAs: 'TLC',
                templateUrl: 'app/admin/modules/pushnotification/views/tasker_list.html',
                resolve: {
                    TaskernotificationServiceResolve: function (TaskernotificationService) {
                        return TaskernotificationService.getTaskerList();
                    }
                }
            })
            .state('app.pushnotifications.templates', {
                url: '/templates',
                controller: 'NotificationListCtrl',
                controllerAs: 'NLC',
                templateUrl: 'app/admin/modules/pushnotification/views/push-notification-list.html',
                resolve: {
                    NotificationListServiceResolve: function (notificationListService) {
                        return notificationListService.getNotificationsList();
                    }
                }
            })
            .state('app.pushnotifications.email', {
                url: '/add-email/:id',
                controller: 'NotificationemailCtrl',
                controllerAs: 'NELC',
                templateUrl: 'app/admin/modules/pushnotification/views/addEmailnotification.html',
                resolve: {
                    emailEditReslove: function (emailService, $stateParams) {
                        if ($stateParams.id) {
                            return emailService.getNotificationemail($stateParams.id);
                        } else {
                            return emailService.getNotificationemail();
                        }
                    }
                }
            })
            /*
            .state('app.pushnotifications.message', {
                url: '/add-message/:id',
                controller: 'NotificationmessageCtrl',
                controllerAs: 'NMLC',
                templateUrl: 'app/admin/modules/notification/views/addMessagenotification.html'
            })
            */
            .state('app.postheader', {
                url: '/postheader',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.postheader.viewpostheader', {
                url: '/list-postheader',
                action: 'all',
                controller: 'viewPostHeaderCtrl',
                controllerAs: 'VPHC',
                templateUrl: 'app/admin/modules/postheader/views/viewPostHeader.html',
                resolve: {
                    PostHeaderViewServiceResolve: function (PostheaderService) {
                        return PostheaderService.getPostHeaderList(10, 0);
                    }
                }
            })
            .state('app.postheader.addpostheader', {
                url: '/add-postheader/:id',
                action: 'add',
                controller: 'editPostheaderCtrl',
                controllerAs: 'EPHC',
                templateUrl: 'app/admin/modules/postheader/views/editAddPostHeader.html',
                resolve: {
                    postheaderServiceResolve: function ($stateParams, PostheaderService) {
                        if ($stateParams.id) {
                            return PostheaderService.getPostheader($stateParams.id);
                        } else {
                            return PostheaderService.getPostheader();
                        }
                    }
                }
            })
            .state('app.locations', {
                url: '/locations',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.locations.list', {
                url: '/list-locations',
                action: 'all',
                controller: 'viewLocationsCtrl',
                controllerAs: 'VPLC',
                templateUrl: 'app/admin/modules/location/views/viewLocation.html',
                resolve: {
                    LocationsViewServiceResolve: function (LocationsService) {
                        return LocationsService.getLocationList(10, 0);
                    }
                }
            })
            .state('app.locations.action', {
                url: '/add-location/:id',
                action: 'add',
                controller: 'editlocationCtrl',
                controllerAs: 'EPLC',
                templateUrl: 'app/admin/modules/location/views/editAddLocation.html',
                resolve: {
                    locationServiceResolve: function ($stateParams, LocationsService) {
                        if ($stateParams.id) {
                            return LocationsService.getLocation($stateParams.id);
                        } else {
                            return LocationsService.getLocation();
                        }
                    }
                }
            })
            .state('app.postfooter', {
                url: '/postfooter',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.postfooter.viewpostfooter', {
                url: '/list-postfooter',
                action: 'all',
                controller: 'viewPostfooterCtrl',
                controllerAs: 'VPFC',
                templateUrl: 'app/admin/modules/postfooter/views/viewpostfooter.html',
                resolve: {
                    PostFooterViewServiceResolve: function (PostfooterService) {
                        return PostfooterService.getPostFooterList(10, 0);
                    }
                }
            })
            .state('app.postfooter.addpostfooter', {
                url: '/add-postfooter/:id',
                action: 'add',
                controller: 'editPostfooterCtrl',
                controllerAs: 'EPFC',
                templateUrl: 'app/admin/modules/postfooter/views/editaddpostfooter.html',
                resolve: {
                    postfooterServiceResolve: function ($stateParams, PostfooterService) {
                        if ($stateParams.id) {
                            return PostfooterService.getPostfooter($stateParams.id);
                        } else {
                            return {};
                        }
                    }
                }
            })
            .state('app.coupons', {
                url: '/coupons',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.coupons.list', {
                url: '/coupon-list',
                action: 'all',
                controller: 'couponsListCtrl',
                controllerAs: 'CLC',
                templateUrl: 'app/admin/modules/coupons/views/coupon_list.html',
                resolve: {
                    CouponServiceResolve: function (CouponService) {
                        return CouponService.list();
                    }
                }
            })
            .state('app.coupons.action', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editCouponCtrl',
                controllerAs: 'ECC',
                templateUrl: 'app/admin/modules/coupons/views/add_coupon.html',
                resolve: {
                    CouponEditServiceResolve: function (CouponService, $stateParams) {
                        if ($stateParams.id) {
                            return CouponService.edit($stateParams.id);
                        } else {
                            return CouponService.edit();
                        }
                    },
                    CouponAvailableUserServiceResolve: function (CouponService) {
                        return CouponService.userGet();
                    }
                }
            })
            .state('app.paymentgateway', {
                url: '/payment-gateway',
                action: 'all',
                template: '<div ui-view></div>'
            })
            .state('app.paymentgateway.list', {
                url: '/list',
                action: 'all',
                controller: 'paymentGatewayCtrl',
                controllerAs: 'PAYGC',
                templateUrl: 'app/admin/modules/payment-gateway/views/payment_gateway_list.html',
                resolve: {
                    PaymentGatewayServiceResolve: function (PaymentGatewayService) {
                        return PaymentGatewayService.list(10, 0);
                    }
                }
            })
            .state('app.paymentgateway.edit', {
                url: '/edit/:id',
                action: 'add',
                controller: 'editPaymentCtrl',
                controllerAs: 'EPAYGC',
                templateUrl: 'app/admin/modules/payment-gateway/views/payment_gateway_edit.html',
                resolve: {
                    PaymentGatewayEditServiceResolve: function ($stateParams, PaymentGatewayService) {
                        return PaymentGatewayService.edit($stateParams.id);
                    }
                }
            })
            .state('app.country', {
                url: '/country',
                template: '<div ui-view></div>'
            })
            .state('app.country.viewsCountry', {
                url: '/view-country',
                controller: 'viewCountryCtrl',
                controllerAs: 'VCC',
                templateUrl: 'app/admin/modules/manage-country/views/viewManageCountry.html',
                resolve: {
                    CountryServiceResolve: function (CountryService) {
                        return CountryService.getCountryList(10, 0);
                    }
                }
            })
            .state('app.country.add', {
                url: '/add/:id',
                controller: 'editCountryCtrl',
                controllerAs: 'EDCC',
                templateUrl: 'app/admin/modules/manage-country/views/editManageCountry.html',
                resolve: {
                    CountryEditReslove: function ($stateParams, CountryService) {
                        return CountryService.getCountry($stateParams.id);
                    }
                }
            });
    }])
    .filter('timeago', function () {
        return function (input, p_allowFuture) {
            var substitute = function (stringOrFunction, number, strings) {
                var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
                var value = (strings.numbers && strings.numbers[number]) || number;
                return string.replace(/%d/i, value);
            },
                nowTime = (new Date()).getTime(),
                date = (new Date(input)).getTime(),
                allowFuture = p_allowFuture || false,
                strings = {
                    prefixAgo: null,
                    prefixFromNow: null,
                    suffixAgo: "ago",
                    suffixFromNow: "from now",
                    seconds: "less than a minute",
                    minute: "about a minute",
                    minutes: "%d minutes",
                    hour: "about an hour",
                    hours: "about %d hours",
                    day: "a day",
                    days: "%d days",
                    month: "about a month",
                    months: "%d months",
                    year: "about a year",
                    years: "%d years"
                },
                dateDifference = nowTime - date,
                words,
                seconds = Math.abs(dateDifference) / 1000,
                minutes = seconds / 60,
                hours = minutes / 60,
                days = hours / 24,
                years = days / 365,
                separator = strings.wordSeparator === undefined ? " " : strings.wordSeparator,
                prefix = strings.prefixAgo,
                suffix = strings.suffixAgo;

            if (allowFuture) {
                if (dateDifference < 0) {
                    prefix = strings.prefixFromNow;
                    suffix = strings.suffixFromNow;
                }
            }

            words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
                seconds < 90 && substitute(strings.minute, 1, strings) ||
                minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
                minutes < 90 && substitute(strings.hour, 1, strings) ||
                hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
                hours < 42 && substitute(strings.day, 1, strings) ||
                days < 30 && substitute(strings.days, Math.round(days), strings) ||
                days < 45 && substitute(strings.month, 1, strings) ||
                days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
                years < 1.5 && substitute(strings.year, 1, strings) ||
                substitute(strings.years, Math.round(years), strings);

            return $.trim([prefix, words, suffix].join(separator));
        }
    })
    .controller('MainCtrl', function (MainResolve, $scope, $rootScope, $cookies, MainService, toastr) {

        var mac = this;
        /*
        var value = '';
        value = $cookies.get("username");
        $cookies.remove('username');
        */

        if (MainResolve) {
            $scope.username = MainResolve.username;
            $scope.menus = MainResolve.menu;
            $scope.presentUser = MainResolve;
            $scope.privileges = MainResolve.privileges;
        }

        $scope.changeLanguage = function (langKey) {
            $scope.currentLanguage = langKey;
        };

        $rootScope.CurrentUser = MainService.getCurrentUserValue();

        MainService.getTaskerPendingList().then(function (response) {
            $scope.pendingTaskers = response[0];
            $scope.pendingTaskerLength = response[1];
        });

        if ($scope.presentUser) {
            $scope.settingdata = $scope.presentUser.privileges.filter(function (menu) {
                return (menu.alias === "settings");
            }).map(function (menu) {
                return menu.status;
            })[0];
            $scope.Profiledata = $scope.presentUser.privileges.filter(function (menu) {
                return (menu.alias === "administrators");
            }).map(function (menu) {
                return menu.status;
            })[0];
        }
    })

    .controller('DatepickerDemoCtrl', function ($scope) {

        $scope.today = function () {
            $scope.dt = new Date();
        };

        $scope.mindate = new Date();
        $scope.today();
        $scope.clear = function () {
            $scope.dt = null;
        };

        $scope.disabled = function (date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        };

        $scope.toggleMin();

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 0,
            'class': 'datepicker'
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
    })

    .controller('RootCtrl', function ($scope, MainService) {
        var rc = this;
        //$rootScope.globals = $cookieStore.get('globals') || {};
        MainService.settings().then(function (data) {
            rc.title = 'Admin Panel | ' + data.site_title;
            rc.favicon = data.site_url + data.favicon;
            rc.logo = data.site_url + data.logo;
            $scope.date = { 'format': data.date_format, 'timezone': data.time_zone };
            $scope.siteUrl = data.site_url;

        });

        MainService.getImage().then(function (data) {
            $scope.getImage = data.filter(function (image) {
                if (image.imagefor == 'adminlogin') {
                    return image;
                }
            })
        });

        MainService.themecolor().then(function (data) {
            $scope.main = {
                title: data.site_title,
                settings: {
                    navbarHeaderColor: data.admin.colors.header,
                    sidebarColor: data.admin.colors.sidebar,
                    brandingColor: data.admin.colors.branding,
                    activeColor: data.admin.colors.active,
                    headerFixed: data.admin.fixed_header == 'true' ? true : false,
                    asideFixed: data.admin.fixed_aside == 'true' ? true : false
                }
            };
        });

        MainService.language().then(function (data) {
            $scope.defaultLanguage = data._id;
        });

        MainService.currency().then(function (data) {
            $scope.defaultCurrency = data._id;
            $scope.currency = {};
            $scope.currency.value = data.value;
            $scope.currency.symbol = data.symbol;
        });

        $scope.tinymceOptions = {
            plugins: 'link image code',
            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
        };
    })
    .filter('money', ['$filter', function (filter) {
        var currencyFilter = filter('currency');
        return function (amount, data) {
            var calAmount = amount * data.value;
            var fractionSize = 2;
            return currencyFilter(calAmount, data.symbol + ' ', fractionSize);
        }
    }])
    .filter('clock', function () {
        return function (timestamp, date) {
            return moment.tz(timestamp, date.timezone).format(date.format);
        }
    })
    .filter('clocksettings', function () {
        return function (timestamp, format, timezone) {
            return moment.tz(timestamp, timezone).format(format);
        }
    })
    .filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })
    .filter('exactFilter', function () {
        return function (input, key, value) {
            if (value == undefined || value == '') {
                return input;
            } else {
                var array = [];
                input.forEach(function (objkey) {
                    if (value == "all") {
                        return array.push(objkey);
                    }
                    else if (objkey[key] === value) {
                        return array.push(objkey);
                    }
                });
                return array;
            }
        };
    })
    .directive('googleplace', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, model) {
                var options = {
                    types: [],
                    componentRestrictions: { country: 'in' }
                };
                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
                console.log(scope.gPlace)
                google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                    scope.$apply(function () {
                        model.$setViewValue(element.val());
                    });
                });
            }
        };
    })
    .directive('errSrc', function () {
        return {
            link: function (scope, element, attrs) {
                element.bind('error', function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.errSrc = "uploads/default/default.jpg";
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    })
    .directive('convertToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return val ? parseInt(val, 10) : null;
                });
                ngModel.$formatters.push(function (val) {
                    return val ? '' + val : null;
                });
            }
        };
    })
    .directive('dateValidator', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attr, ngModel) {
                function validate(value) {
                    if (value) { ngModel.$setValidity('date', true); }
                }
                scope.$watch(function () { return ngModel.$viewValue; }, validate);
            }
        };
    })
    .directive('date', function (dateFilter) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {

                var dateFormat = attrs['date'] || 'yyyy-MM-dd hh:mm';

                ctrl.$formatters.unshift(function (modelValue) {
                    return dateFilter(modelValue, dateFormat);
                });
            }
        };
    })
    .directive('allowOnlyNumbers', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.on('keydown', function (event) {
                    if (event.which == 64 || event.which == 16) {
                        return false;
                    } else if (event.which == 9) {
                        return true;
                    } else if (event.which >= 48 && event.which <= 57) {
                        return true;
                    } else if (event.which >= 96 && event.which <= 105) {
                        return true;
                    } else if ([8, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
                        return true;
                    } else {
                        event.preventDefault();
                        return false;
                    }
                });
            }
        }
    }).directive('disallowSpaces', function () {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $element.bind('input', function () {
                    $(this).val($(this).val().replace(/ /g, ''));
                });
            }
        };
    });
