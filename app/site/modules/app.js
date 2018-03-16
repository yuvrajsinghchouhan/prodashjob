//'use strict';

// Angular Module's Initializations
angular.module('Authentication', []);
angular.module('quickRabbit.contactus', []);
angular.module('quickRabbit.page', []);
angular.module('quickRabbit.faq', []);
//angular.module('quickRabbit.dashboard', []);
angular.module('quickRabbit.becometasker', []);
angular.module('quickRabbit.category', []);
angular.module('quickRabbit.task', []);
angular.module('quickRabbit.accounts', []);
angular.module('quickRabbit.messages', []);
angular.module('quickRabbit.carddeatil', []);
angular.module('quickRabbit.forgotpassword', []);
angular.module('quickRabbit.notifications', []);

//Main module
angular.module('quickRabbit.site', ['Authentication',
    'ngAnimate',
    'ngSanitize',
    'ngCookies',
    'ui.calendar',
    'ui.validate',
    'ui.bootstrap',
    'ui.router',
    'toastr',
    'pascalprecht.translate',
    'ngFileUpload',
    'ngMap',
    'ngImgCrop',
    'slugifier',
    'checklist-model',
    'ngIntlTelInput',
    'hSweetAlert',
    'ui.select',
    'ngMeta',
    'ui.slider',
    'afkl.lazyImage',
    'quickRabbit.contactus',
    'quickRabbit.faq',
    'quickRabbit.becometasker',
    'quickRabbit.category',
    'quickRabbit.task',
    'quickRabbit.page',
    'quickRabbit.accounts',
    'quickRabbit.messages',
    'quickRabbit.carddeatil',
    'quickRabbit.notifications',
    'quickRabbit.forgotpassword',
])
    .run(['$rootScope', '$state', '$location', '$cookieStore', '$http', '$stateParams', 'AuthenticationService', 'toastr', 'MainService', '$window', 'socket', 'ngMeta', function ($rootScope, $state, $location, $cookieStore, $http, $stateParams, AuthenticationService, toastr, MainService, $window, socket, ngMeta) {
        ngMeta.init();
        $rootScope.$state = $state;
        $rootScope.siteglobals = $cookieStore.get('siteglobals') || {};
        if ($rootScope.siteglobals.currentUser) {
            //$http.defaults.headers.common['Authorization'] = $rootScope.siteglobals.currentUser.authdata;
            MainService.getCurrentUsers($rootScope.siteglobals.currentUser.username)
                .then(function (result) {
                    if (typeof $rootScope.currentUser == 'wrong') {
                        $window.location.href = '/login';
                    } else {
                        MainService.setCurrentUserValue(result[0]);
                    }
                }, function (error) {
                    toastr.error('Server Down !');
                });
        }
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var userdata = AuthenticationService.GetCredentials();

            if (userdata.currentUser) {
                if (toState.name == "hirestep1" && userdata.currentUser.user_type == 'tasker') {
                    $state.transitionTo("login");
                    toastr.error("Tasker Cannot  access");
                    event.preventDefault();
                }
            }

            if (toState.name == "hirestep1" || toState.name == "chat") {
                if (!$rootScope.siteglobals.currentUser) {
                    $state.transitionTo("login");
                    event.preventDefault();
                }
            }
            if (toState.authenticate && !AuthenticationService.isAuthenticated()) {
                $state.transitionTo("login");
                event.preventDefault();
            }

            if (toState.registerauthenticate && !((toParams.type == 'user' || toParams.type == 'tasker') && !AuthenticationService.isAuthenticated())) {
                if (AuthenticationService.isAuthenticated()) {
                    $state.transitionTo("landing");
                } else {
                    $state.transitionTo("signup");
                }
                event.preventDefault();
            }

            if (toState.taskerauthenticate && AuthenticationService.isTaskerAuthenticated()) {
                $state.transitionTo("landing");
                event.preventDefault();
            }

            if (toState.loginauthenticate && AuthenticationService.isAuthenticated()) {
                $state.transitionTo("landing");
                event.preventDefault();
            }

            $rootScope.PreviousState = fromState;
            $rootScope.Previousparams = fromParams;
            $rootScope.currentState = toState;
            $rootScope.currentparams = toParams;

        });
    }])
    .factory('myHttpInterceptor', function ($q, $location, $rootScope, $cookieStore) {
        var timestampMarker = {
            response: function (response) {
                $rootScope.imgSrc = false;
                if (response.status == 404) {
                    $location.path('/404');
                }
                return response;
            },
            'responseError': function (rejection) {
                if (rejection.status == 401) {
                    $cookieStore.remove('siteglobals')
                    $location.path('/login');
                }
                return $q.reject(rejection);
            },
            request: function (config) {
                $rootScope.imgSrc = "/app/site/public/images/loader.gif";
                return config || $q.when(config);
            }
        };
        return timestampMarker;
    })
    .config(function (ngMetaProvider, ngIntlTelInputProvider, toastrConfig) {
        ngMetaProvider.useTitleSuffix(true);
        ngIntlTelInputProvider.set({ defaultCountry: '' });
        angular.extend(toastrConfig, {
            autoDismiss: true,
            maxOpened: 1,
            tapToDismiss: true,
            closeButton: true,
            closeHtml: '<i class="fa fa-times"></i>'
        });
    })
    .config(['$translateProvider', '$urlMatcherFactoryProvider', function ($translateProvider, $urlMatcherFactoryProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '/uploads/languages/',
            suffix: '.json'
        });
        $translateProvider.useLocalStorage();
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.fallbackLanguage('en');
        $urlMatcherFactoryProvider.caseInsensitive(false);
        $urlMatcherFactoryProvider.strictMode(true);
    }])
    .factory('PreviousState', ['$rootScope', '$state',
        function ($rootScope, $state) {
            var lastHref = "/",
                lastStateName = "landing",
                lastParams = {},
                event = "";
            $rootScope.$on("$stateChangeSuccess", function (events, toState, toParams, fromState, fromParams) {
                event = events;
                lastStateName = fromState.name;
                lastParams = fromParams;
                lastHref = $state.href(lastStateName, lastParams)

            });

            return {
                getLastHref: function () { return lastHref; },
                goToLastState: function () {
                    return $state.go(lastStateName, lastParams);
                }
            }
        }])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/404');
        $httpProvider.interceptors.push('myHttpInterceptor');
        $stateProvider
            .state('landing', {
                url: '/',
                views: {
                    "content": {
                        templateUrl: "app/site/modules/common/views/landing.html",
                        controller: "MainCtrl",
                        controllerAs: 'MAC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Home'
                    }
                },
                resolve: {
					
                    MainserviceResolve: function (MainService) {
						// $cookieStore.remove('TaskerData');
                        return MainService.landingdata();						
						
                    }
                }
            })
            .state('morecategories', {
                url: '/morecategories/:slug',
                views: {
                    "content": {
                        templateUrl: "app/site/modules/common/views/morecategories.html",
                        controller: "MorecategoryCtrl",
                        controllerAs: 'MOC'
                    }
                },
                resolve: {
                    MorecategoryserviceResolve: function (MainService, $stateParams) {
                        return MainService.getmorecategory($stateParams.slug);
                    }
                }
            })
            .state('category', {
                url: '/category/:slug',
                views: {
                    "content": {
                        templateUrl: "/app/site/modules/category/views/category.html",
                        controller: "categoryCtrl",
                        controllerAs: 'CAC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Category'
                    }
                },
                resolve: {
                    CategoryserviceResolve: function (CategoryService, $stateParams) {
                        return CategoryService.getcategory($stateParams.slug, 0, 6);
                    }
                }
            })
            .state('forgotpwd', {
                url: '/forgot_passwrd',
                controller: "pwdloginCtrl",
                controllerAs: 'PWC',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/forgetpassword.html",
                        controller: "pwdloginCtrl",
                        controllerAs: 'PWC'
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'Forgot Your Password'
                    }
                },
                resolve: {
                    ForgotpasswordServiceResolve: function (ForgotpasswordService) {
                        return true;
                    }
                }
            })
            .state('forgotpwduser', {
                url: '/forgot_passwrduser',
                controller: "pwduserCtrl",
                controllerAs: 'PWUC',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/forgetpassworduser.html",
                        controller: "pwduserCtrl",
                        controllerAs: 'PWUC'
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'Forgot Your Password'
                    }
                },
                resolve: {
                    ForgotpwduserServiceResolve: function (ForgotpwduserService) {
                        return true;
                    }
                }
            })
            .state('signupotp', {
                url: '/userverfication/:id',
                views: {
                    commonview: {
                        templateUrl: "app/site/modules/common/views/OTPSignup_model.html",
                        controller: "otploginCtrl",
                        controllerAs: 'OTPC'
                    }
                }
            })
            /*.state('accountRecovery', {
              url: '/accountRecovery/:id',
              views: {
                commonview: {
                      templateUrl: "app/site/modules/common/views/accountRecovery.html",
                      controller: "otploginCtrl",
                      controllerAs: 'OTPC'
                  }
              }
          })*/
            .state('forgotpwdusermail', {
                url: '/forgotpwdusermail/:userid/:resetid',
                controller: "pwdmailCtrl",
                controllerAs: 'PWMC',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/forgetpwdemaillink.html",
                        controller: "pwdmailCtrl",
                        controllerAs: 'PWMC'
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'Forgot Your Password'
                    }
                }

            })
            .state('emergency', {
                url: '/emergency/:userid',
                controller: "emergencyCtrl",
                controllerAs: 'EMRG',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/emergencycontact.html",
                        controller: "emergencyCtrl",
                        controllerAs: 'EMRG'
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'Emergency Contact'
                    }
                }

            })
            .state('forgotpwdtaskermail', {
                url: '/forgotpwdtaskermail/:userid/:resetid',
                controller: "pwdmailtskrCtrl",
                controllerAs: 'PWMTC',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/forgetpwdemaillinktasker.html",
                        controller: "pwdmailtskrCtrl",
                        controllerAs: 'PWMTC'
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'Forgot Your Password'
                    }
                }
            })
            .state('page', {
                url: '/page/:slug',
                views: {
                    "content": {
                        templateUrl: "/app/site/modules/pages/views/pages.html",
                        controller: "pagesCtrl",
                        controllerAs: 'PAC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Page'
                    }
                },
                resolve: {

                   /* PagesserviceResolve: function (PageService, $stateParams, $rootScope, $cookieStore, MainService) {
                         MainService.getDefaultLanguage().then(function (response) {
                            $rootScope.language = response[0].name;
                          });
                      console.log(" $rootScope.language***********", $rootScope.language);
                        return PageService.getpage($stateParams, $rootScope.language);
                    }*/
                    PagesserviceResolve: function (PageService, $stateParams, $rootScope, $cookieStore, MainService) {
                          var languageUpdateValue = $cookieStore.get('language');
                          if($rootScope.language == undefined){
                              $rootScope.language = languageUpdateValue;
                          }
                         return PageService.getpage($stateParams, $rootScope.language);
                    }
                }
            })
            .state('login', {
                url: '/login',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/login.html",
                    },
                    commonview: {
                        template: "<div></div>"
                    }
                },
                data: {
                    meta: {
                        'title': 'Login'
                    }
                }

            })
            .state('userlogin', {
                url: '/user_login',
                controller: "userloginCtrl",
                controllerAs: 'ULGC',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/user-login.html",
                        controller: "userloginCtrl",
                        controllerAs: 'ULGC'
                    },
                    commonview: {
                        template: "<div></div>"
                    }
                },
                data: {
                    meta: {
                        'title': 'User Login'
                    }
                }
            })
            .state('taskerlogin', {
                url: '/tasker_login',
                controller: "taskerloginCtrl",
                controllerAs: 'TLGC',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/tasker-login.html",
                        controller: "taskerloginCtrl",
                        controllerAs: 'TLGC'
                    },
                    commonview: {
                        template: "<div></div>"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker Login'
                    }
                }
            })
            .state('become_tasker', {
                url: '/become_tasker',
                views: {
                    "content": {
                        templateUrl: "app/site/modules/common/views/taker.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Become Tasker'
                    }
                }
            })
            .state('contact_us', {
                url: '/contact_us',
                views: {
                    "content": {
                        templateUrl: "app/site/modules/common/views/contactus.html",
                        controller: "contactCtrl",
                        controllerAs: 'CTTC'
                    },
                },
                data: {
                    meta: {
                        'title': 'Contact Us'
                    }
                }
            })
            .state('faq', {
                url: '/faq',
                views: {
                    "content": {
                        templateUrl: "/app/site/modules/common/views/faq.html",
                        controller: "faqCtrl",
                        controllerAs: 'FAC'
                    }
                },
                data: {
                    meta: {
                        'title': 'FAQ'
                    }
                },
                resolve: {
                    FaqserviceResolve: function (FaqService) {
                        return FaqService.getfaq();

                    }
                }
            })
            .state('registertasker', {
                url: '/register-tasker',
                views: {
                    "content": {
                        template: '<div ui-view="registertasker"></div>',
                        controller: "registerTaskerCtrl",
                        controllerAs: 'RTTC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })
            .state('signup', {
                url: '/signup',
                loginauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/signup.html"
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'SignUp'
                    }
                }
            })
            .state('social', {
                url: '/social/:type',
                registerauthenticate: true,
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/social.html",
                        controller: "userloginCtrl",
                        controllerAs: 'ULGC'
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'SignUp'
                    }
                }
            })
            .state('messages', {
                url: '/messages',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/messages/views/messages.html",
                        controller: "messagesCtrl",
                        controllerAs: 'MSG'
                    }
                },
                data: {
                    meta: {
                        'title': 'Messages'
                    }
                },
                resolve: {
                    MessageserviceResolve: function (AuthenticationService, MessageService) {
                        var user = AuthenticationService.GetCredentials();
                        return MessageService.getMessage(user.currentUser.user_id, user.currentUser.user_type, 0, 3);
                    },
                    CurrentuserResolve: function (AuthenticationService) {
                        var user = AuthenticationService.GetCredentials();
                        return user.currentUser;
                    }
                }
            })
            .state('notifications', {
                url: '/notifications',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/notifications/views/notifications.html",
                        controller: "notificationCtrl",
                        controllerAs: 'NC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Notifications'
                    }
                },
                resolve: {
                    NotificationsResolve: function (AuthenticationService, NotificationService) {
                        var user = AuthenticationService.GetCredentials();
                        var data = {};
                        data.user = user.currentUser.user_id;
                        data.type = user.currentUser.user_type;
                        return NotificationService.getMessage(data, 0, 3);
                    }
                }
            })
            .state('404', {
                url: '/404',
                views: {
                    specialview: {
                        templateUrl: "app/site/modules/common/views/404.html"
                    },
                    commonview: { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'PageNotFound'
                    }
                }
            })


            .state('chat', {
                url: '/chat/:task/:user/:tasker',
                views: {
                    "content": {
                        templateUrl: "app/site/modules/messages/views/chat.html",
                        controller: "chatCtrl",
                        controllerAs: 'CHAT'
                    }
                },
                data: {
                    meta: {
                        'title': 'Messenger'
                    }
                },
                resolve: {
                    ChatServiceResolve: function (AuthenticationService, MessageService, $stateParams, socket) {
                        var user = AuthenticationService.GetCredentials();
                        var data = {};
                        data.task = $stateParams.task;
                        data.user = $stateParams.user;
                        data.tasker = $stateParams.tasker;
                        data.type = user.currentUser.user_type;
                        return MessageService.chatHistory(data);
                    },
                    TaskServiceResolve: function (TaskService, $stateParams) {
                        return TaskService.getTaskDetailsbyid($stateParams.task);
                    },
                    TaskProfileResolve: function (TaskService, $stateParams) {
                        return TaskService.taskprofileinfo($stateParams.tasker);
                    },
                    CurrentuserResolve: function (AuthenticationService) {
                        var user = AuthenticationService.GetCredentials();
                        return user.currentUser;
                    }
                }
            })

            .state('register', {
                url: '/register/:type',
                registerauthenticate: true,
                views: {
                    "specialview": {
                        templateUrl: "app/site/modules/common/views/user-register.html",
                        controller: "registerCtrl",
                        controllerAs: 'RGC'
                    },
                    "commonview": { template: "<div></div>" }
                },
                data: {
                    meta: {
                        'title': 'User SignUp'
                    }
                }
            })
            .state('becometasker', {
                url: '/become-tasker',
                views: {
                    "content": {
                        template: '<div ui-view="becometasker"></div>',
                        controller: "becomeTaskerCtrl",
                        controllerAs: 'BTC'
                    }

                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                },
                resolve: {
                    BecomeTaskerResolve: function (MainService) {

                    },
                    CategoryserviceResolve: function (CategoryService) {
                        return CategoryService.getcategoryList();
                    }

                }
            })

            .state('becometasker.step0', {
                url: '/basicinfo',
                views: {
                    "becometasker": {
                        templateUrl: "app/site/modules/tasker/views/basicinfo-step0.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })

            .state('becometasker.step1', {
                url: '/basicinfo',
                taskerauthenticate: true,
                views: {
                    "becometasker": {
                        templateUrl: "app/site/modules/tasker/views/addressInfo-step1.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })
            .state('becometasker.step3', {
                url: '/basicinfo',
                taskerauthenticate: true,
                views: {
                    "becometasker": {
                        templateUrl: "app/site/modules/tasker/views/availabiltyInfo-step3.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })
            .state('becometasker.step7', {
                url: '/basicinfo',
                taskerauthenticate: true,
                views: {
                    "becometasker": {
                        templateUrl: "app/site/modules/tasker/views/imageInfo-step7.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })
            .state('becometasker.step8', {
                url: '/basicinfo',
                taskerauthenticate: true,
                views: {
                    "becometasker": {
                        templateUrl: "app/site/modules/tasker/views/hoursInfo-step8.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })
            .state('becometasker.success', {
                url: '/basicinfo',
                views: {
                    "becometasker": {
                        templateUrl: "app/site/modules/tasker/views/post_step8.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker SignUp'
                    }
                }
            })
            .state('hirestep1', {
                url: '/hirestep1/:slug',
                views: {
                    content: {
                        templateUrl: "app/site/modules/task-step/views/hire-step1.html",
                        controller: "taskCtrl",
                        controllerAs: 'TAC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Task'
                    }
                },
                resolve: {
                    TaskserviceResolve: function (TaskService, $stateParams, AuthenticationService) {
                        return TaskService.taskbaseinfo($stateParams.slug);
                    },
                    CurrentUserTaskserviceResolve: function (MainService, AuthenticationService) {
                        var user = AuthenticationService.GetCredentials();
                        return MainService.getCurrentUsers(user.currentUser.username);
                    }
                }
            })
            .state('search', {
                url: '/search/:slug?&task',
                views: {
                    content: {
                        templateUrl: "app/site/modules/task-step/views/search-results.html",
                        controller: "taskFilterCtrl",
                        controllerAs: 'TFC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Task'
                    }
                },
                resolve: {
                    SearchResolve: function (TaskService, $stateParams) {
                        return TaskService.searchTasker($stateParams.task);
                    },
                    TaskserviceResolve: function (TaskService, $stateParams) {
                        return TaskService.taskbaseinfo($stateParams.slug);
                    },
                    CurrentUserTaskserviceResolve: function (MainService, AuthenticationService) {
                        var user = AuthenticationService.GetCredentials();
                        if (user.currentUser.username) {
                            return MainService.getCurrentUsers(user.currentUser.username);
                        }
                    },
                    TaskServiceNewResolve: function (TaskService, $stateParams) {
                        return TaskService.getTaskDetailsbyid($stateParams.task);
                    },
                    TaskerCountResolve: function (TaskService, $stateParams) {
                        return TaskService.taskerCount($stateParams.task, 0, 5);
                    }

                }
            })
            .state('account', {
                url: '/account',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/accounts/views/accounts.html",
                        controller: "accountsCtrl",
                        controllerAs: 'ACC'
                    }
                },
                data: {
                    meta: {
                        'title': 'My Account'
                    }
                },
                resolve: {
                    accountServiceResolve: function (AuthenticationService, MainService) {
                        var user = AuthenticationService.GetCredentials();
                        if (user.currentUser.username) {
                            if (user.currentUser.user_type == 'user') {
                                return MainService.getCurrentUsers(user.currentUser.username);
                            } else if (user.currentUser.user_type == 'tasker') {
                                return MainService.getCurrentTaskers(user.currentUser.username);
                            }
                        }
                    }
                }
            })
            .state('notifyaccount', {
                url: '/notifyaccount/:status',
                views: {
                    "content": {
                        templateUrl: "app/site/modules/accounts/views/accounts.html",
                        controller: "accountsCtrl",
                        controllerAs: 'ACC'
                    }
                },
                data: {
                    meta: {
                        'title': 'My Account'
                    }
                },
                resolve: {
                    accountServiceResolve: function (AuthenticationService, MainService, $stateParams) {
                        console.log('$stateParams', $stateParams);
                        var user = AuthenticationService.GetCredentials();
                        if (user.currentUser.username) {
                            if (user.currentUser.user_type == 'user') {
                                return MainService.getCurrentUsers(user.currentUser.username);
                            } else if (user.currentUser.user_type == 'tasker') {
                                return MainService.getCurrentTaskers(user.currentUser.username);
                            }
                        }
                    }
                }
            })
            .state('carddeatil', {
                url: '/carddeatil/:slug',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/carddetail/views/carddetail.html",
                        controller: "carddetailCtrl",
                        controllerAs: 'CDC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Payment'
                    }
                },
                resolve: {
                    CarddetailResolve: function (CarddetailService, $stateParams) {
                        return CarddetailService.gettaskbyid($stateParams.slug);
                    },
                    CurrentUserResolve: function (MainService, AuthenticationService) {
                        var user = AuthenticationService.GetCredentials();
                        if (user.currentUser.username) {
                            return MainService.getCurrentUsers(user.currentUser.username);
                        }
                    }
                }
            })
            .state('paymentsuccess', {
                url: '/payment-success',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/carddetail/views/carddetailsuccess.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Payment'
                    }
                }
            })
            .state('walletsuccess', {
                url: '/wallet-success',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/carddetail/views/walletsuccess.html"
                    }
                },
                data: {
                    meta: {
                        'title': 'Payment'
                    }
                }
            })
            .state('paymentfailed', {
                url: '/payment-failed/:task',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/carddetail/views/carddetailfailed.html",
                        controller: "paypalfaileddetailCtrl",
                        controllerAs: 'PPDC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Payment'
                    }
                },
                resolve: {
                    paypaltaskid: function ($stateParams) {
                        return $stateParams;
                    }
                }
            })
              .state('paymentfaileduser', {
                url: '/walletpayment-failed',
                authenticate: true,
                views: {
                    "content": {
                        templateUrl: "app/site/modules/carddetail/views/carddetailfaileduser.html",
                        controller: "paypalfaileddetailCtrl",
                        controllerAs: 'PPDC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Payment'
                    }
                },
                resolve: {
                    paypaltaskid: function ($stateParams) {
                        return $stateParams;
                    }
                }
            })

            .state('logout', {
                url: '/logout',
                views: {
                    "content": {
                        controller: "LogoutController",
                        controllerAs: 'DBC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Logout'
                    }
                }
            })
            .state('taskerProfile', {
                url: '/tasker/:taskerId',
                views: {
                    content: {
                        templateUrl: "app/site/modules/task-step/views/tasker_profile.html",
                        controller: "taskProfileCtrl",
                        controllerAs: 'TPC'
                    }
                },
                data: {
                    meta: {
                        'title': 'Tasker Details'
                    }
                },
                resolve: {
                    TaskProfileResolve: function (TaskService, $stateParams) {
                        return TaskService.taskprofileinfo($stateParams.taskerId);
                    }
                }
            })
    }])
    .controller('rootCtrl', function ($window, $scope, $rootScope, $state, AuthenticationService, MainService, socket, notify, $translate, toastr, $cookieStore, ngMeta, $sce) {
        var rc = this;

        MainService.getMainData().then(function (results) {
            rc.title = results.response[0].settings.site_title;
            rc.getsetting = results.response[0].settings;
            //console.log("rc.getsetting",rc.getsetting);
            $scope.cashOption =  rc.getsetting.pay_by_cash.status;
            rc.favicon = results.response[0].settings.site_url + results.response[0].settings.favicon;

            ngMeta.setDefaultTag('title', results.response[1].seo.seo_title);
            ngMeta.setDefaultTag('titleSuffix', ' | ' + rc.title);
            ngMeta.setDefaultTag('keyword', results.response[1].seo.focus_keyword);
            ngMeta.setDefaultTag('description', results.response[1].seo.meta_description);
            $window.ga('create', results.response[1].seo.webmaster.google_analytics, 'auto');


            rc.socialNetworks = results.response[2].social;
            rc.language = results.response[3].languages;
            rc.widgets = results.response[4].widgets;
            rc.signupimg = results.response[5].images[0];
            rc.loginimage = results.response[5].images[3];
            rc.bgimage = results.response[5].images[1];
            rc.tpimg = results.response[5].images[4];

            rc.Currency = results.response[6].currencies;

            $scope.date = { 'format': results.response[0].settings.date_format + ' ' + results.response[0].settings.time_format, 'timezone': results.response[0].settings.time_zone };

        });


        MainService.getDefaultCurrency().then(function (response) {
            if ($cookieStore.get('Currency')) {
                rc.DefaultCurrency = $cookieStore.get('Currency');
                $scope.DefaultCurrency = $cookieStore.get('Currency');
            }
            else {
                rc.DefaultCurrency = response;
                $scope.DefaultCurrency = response;
            }
        });

        rc.setDefaultCurrency = function setDefaultCurrency(data) {
            MainService.getDefaultCurrency(data).then(function (response) {
                rc.DefaultCurrency = response;
                $scope.DefaultCurrency = response;
                $cookieStore.put('Currency', response);
                document.body.scrollTop = document.documentElement.scrollTop = 0;

            });
        };
        rc.otpverifications = function otpverifications(data) {
            if (!data) {
                $translate('ENTER USER NAME').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            } else {
                MainService.otpverifications(data).then(function (response) {
                    rc.userdata = response;
                    if (data == rc.userdata.username) {
                        $state.go('signupotp', { 'id': rc.userdata._id }, { reload: false });
                    } else {
                        $translate('USERNAME ALREADY ACTIVATED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                    }
                }, function (err) {
                    $translate(err.message).then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

                });
            }
        };

        MainService.getDefaultLanguage().then(function (response) {
            if ($cookieStore.get('language')) {
                rc.language_code = $cookieStore.get('language_code');
                rc.DefaultLanguage = $cookieStore.get('language');
                $rootScope.language = $cookieStore.get('language');
                $translate.proposedLanguage(rc.language_code) || $translate.use(rc.language_code);
            } else {
                rc.DefaultLanguage = response[0].name
                $rootScope.language = response[0].name;
                console.log(" $rootScope.language", $rootScope.language);
                $translate.proposedLanguage(response[0].code) || $translate.use(response[0].code);
            }
        });

        rc.setDefaultLanguage = function setDefaultLanguage(data) {
            MainService.getDefaultLanguage(data).then(function (response) {
                $cookieStore.put('language', response[0].name);

                $cookieStore.put('language_code', response[0].code);
                $translate.proposedLanguage(response[0].code) || $translate.use(response[0].code);
                //language
                if (rc.DefaultLanguage) {
                    MainService.getTransalatePage($rootScope.pageId, rc.DefaultLanguage).then(function (response) {
                        //console.log("response////////////////",response);
                        if (response.length != 0) {
                            $scope.html = response[0].description;
                            $rootScope.trustedHtml = $sce.trustAsHtml($scope.html);
                        } else {
                            $rootScope.translatepage = "Translate language is not available";
                        }

                    });
                }

                //language
            });
        };


        $rootScope.$on('notification', function (event, data) {
            AuthenticationService.currentmsgcount(data).then(function (response) {
                $scope.chatCount = response;
            });
        });

        $rootScope.$on('webNotification', function (event, data) {
            MainService.getNotificationsCount(data).then(function (response) {
                $scope.notifyCount = response;
            });
        });

        $rootScope.$on('unreadmsg', function (event, data) {
            AuthenticationService.unreadmsg(data).then(function (response) {
                $scope.unreadmsgs = response;
            });
        });

        $scope.currentUserCredentials = AuthenticationService.GetCredentials();
        if ($scope.currentUserCredentials == '' || Object.keys($scope.currentUserCredentials).length == 0) {
            $rootScope.userId = '';
            $rootScope.username = '';
            $rootScope.usertype = '';
            $rootScope.taskerStatus = '';
        } else {
            $rootScope.userId = $scope.currentUserCredentials.currentUser.user_id;
            $rootScope.username = $scope.currentUserCredentials.currentUser.username;
            $rootScope.usertype = $scope.currentUserCredentials.currentUser.user_type;
            $rootScope.taskerStatus = $scope.currentUserCredentials.currentUser.tasker_status;
            socket.emit('create room', { user: $rootScope.userId });
            notify.emit('join network', { user: $rootScope.userId });
            $rootScope.$emit('notification', { user: $rootScope.userId, type: $rootScope.usertype });
            $rootScope.$emit('webNotification', { user: $rootScope.userId, type: $rootScope.usertype });
            $rootScope.$emit('unreadmsg', { user: $rootScope.userId, type: $rootScope.usertype });
        }

        $scope.tinymceOptions = {
            plugins: 'link image code',
            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
        };

        //--------------------- Socket ---------------------

        socket.on('roomcreated', function (data) {
            $scope.socket = data;
        });

        socket.on('webupdatechat', function (data) {
            if ($state.current.name != 'chat') {
                $rootScope.$emit('notification', { user: $rootScope.userId, type: $rootScope.usertype });
            }
        });

        notify.on('network created', function (data) {
            $scope.socket = data;
        });

        notify.on('web notification', function (data) {
            $rootScope.$emit('webNotification', { user: $rootScope.userId, type: $rootScope.usertype });
            toastr.info(data.message.message, 'Notification');
        });

        // --------------------- Alert ---------------------
        $scope.alerts = [];
        $scope.alertTimeout = 5000;
        $scope.addAlert = function (type, msg) {
            var alert = {};
            alert.type = type;
            alert.msg = msg;
            $scope.alerts.push(alert);
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        }
        // --------------------- /Alert ---------------------

        $rootScope.$on('eventName', function (event, args) {
            $scope.currentUserCredentials = AuthenticationService.GetCredentials();
            $scope.cartcount = args.count;
            if ($scope.currentUserCredentials == '' || Object.keys($scope.currentUserCredentials).length == 0) {
                $rootScope.userId = '';
                $rootScope.username = '';
                $rootScope.usertype = '';
                $rootScope.taskerStatus = '';
            } else {
                $rootScope.userId = $scope.currentUserCredentials.currentUser.user_id;
                $rootScope.username = $scope.currentUserCredentials.currentUser.username;
                $rootScope.usertype = $scope.currentUserCredentials.currentUser.user_type;
                $rootScope.taskerStatus = $scope.currentUserCredentials.currentUser.tasker_status;

            }
        });
    }).controller('MainCtrl', function ($scope, $location, $rootScope, $http, toastr, MainserviceResolve, MainService, $state, $translate) {

        var mac = this;
        mac.myInterval = 9000;
        mac.data = MainserviceResolve;
        mac.postheader = mac.data.response[1].PostHeader;
        mac.banner = mac.data.response[3].slider;

        $scope.getLocation = function getLocation(data) {
            return (MainService.searchSuggestions(data).then(function (response) {
                return response;
            }, function (error) {
                return error;
            }));
        }

        mac.subscription = function subscription(subscriptionForm, data) {
            function clearSubscribe() {
                mac.email = "";
                subscriptionForm.$setPristine();
                subscriptionForm.$setUntouched();
                subscriptionForm.email.$setValidity();
                subscriptionForm.email.$setDirty();
            }

            if (data) {
                return (MainService.subscription(data).then(function (response) {
                    $translate('SUBSCRIBED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
                    clearSubscribe();
                }, function (error) {
                    $translate('EMAIL ALREADY SUBSCRIBED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                    clearSubscribe();
                }));
            } else {
                $translate('INVALID EMAIL').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            }
        };

        $scope.searchData = {};
        mac.getsubcategory = function (parentid) {
            return (MainService.getsubcategory(parentid).then(function (response) {
                $scope.searchData.child = null;
                mac.subcategorydata = response;
                return response;
            }, function (error) {
                return error;
            }));
        };

        $scope.changeparent = function childSuggestions(data) {
            return (MainService.searchchildSuggestions(data).then(function (response) {
                $scope.childcat = response;
            }, function (error) {
                return error;
            }));
        }

        $scope.search = function search(data) {
            if (data.parent) {
                if (data.child) {
                    $state.go('hirestep1', { 'slug': data.child.slug });
                }
                else {
                    $state.go('category', { 'slug': data.parent.slug });
                }
            } else {
                $translate('PLEASE CHOOSE A CATEGORY').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            }
        }
    })
    .controller('MorecategoryCtrl', function (MorecategoryserviceResolve) {
        var moc = this;
        moc.count = 4;
        moc.data = MorecategoryserviceResolve;
    })
    .controller('DatepickerDemoCtrl', function ($scope) {
        $scope.today = function () {
            $scope.dt = new Date();
        };

        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        // Disable weekend selection
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
            startingDay: 1,
            'class': 'datepicker'
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

        $scope.format = $scope.formats[0];
    })

    .controller('DatepickerDobCtrl', function ($scope) {
        $scope.today = function () {
            $scope.dt = new Date();
        };

        $scope.today();

        // Disable weekend selection
        $scope.disabled = function (date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date(1945, 1, 1);
        };
        $scope.toggleMin();

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            'class': 'datepicker'
        };

        $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

        $scope.format = $scope.formats[0];
    })
    /*
    .directive('googleplace', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, model) {
                var options = {
                    types: [],
                    componentRestrictions: { country: 'in' }
                };
                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
                google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                    scope.$apply(function () {
                        model.$setViewValue(element.val());
                    });
                });
            }
        };
    })
    */
    .filter('clock', function () {
        return function (timestamp, date) {
            return moment.tz(timestamp, date.timezone).format(date.format);
        }
    })
    .filter('money', ['$filter', function (filter) {
        var currencyFilter = filter('currency');
        return function (amount, data) {
            var calAmount = amount * data.value;
            var fractionSize = 2;
            return currencyFilter(calAmount, data.symbol + ' ', fractionSize);
        }
    }])
    .filter('clocksettings', function () {
        return function (timestamp, format, timezone) {
            return moment.tz(timestamp, timezone).format(format);
        }
    })
    .directive('submitValidate', function () {
        return {
            require: 'form',
            restrict: 'A',
            link: function (scope, element, attributes) {
                var $element = angular.element(element);
                $element.on('submit', function (e) {
                    $element.find('.ng-pristine').removeClass('ng-pristine').addClass('ng-dirty');
                    var form = scope[attributes.name];
                    angular.forEach(form, function (formElement, fieldName) {
                        if (fieldName[0] === '$') {
                            return;
                        }
                        formElement.$pristine = false;
                        formElement.$dirty = true;
                    }, this);
                    form.$setDirty();
                    scope.$apply();
                });
            }
        };
    })
    .directive('taskAction', function () {
        return {
            restrict: 'EA',
            link: function (scope, element, attributes) {
                var $element = angular.element(element);
                $element.on('click', function (e) {
                    $('.action-space').not($element.parents('.slidetd').find('.action-space')).hide().removeClass('clickd');
                    if (!$element.parents('.slidetd').find('.action-space').hasClass('clickd')) {
                        $element.parents('.slidetd').find('.action-space').show().addClass('clickd');
                    } else {
                        $element.parents('.slidetd').find('.action-space').hide().removeClass('clickd');
                    }
                    e.preventDefault();
                });
            }
        };
    })
    .directive('noRecord', function () {
        return {
            restrict: 'EA',
            scope: {
                numRecords: '=numRecords',
                recordResponse: '=recordResponse'
            },
            link: function (scope, element, attributes) {
                var $element = angular.element(element);
                scope.changecount = 0;
                scope.$watch("numRecords", function (oldvalue, newvale) {
                    scope.changecount++;
                    if (scope.recordResponse == true) {
                        if (scope.numRecords > 0) {
                            $element.css('display', 'none');
                        } else {
                            $element.css('display', 'block');
                        }
                    }
                });
                scope.$watch("recordResponse", function (oldvalue, newvale) {
                    if (scope.recordResponse == true) {
                        if (scope.changecount > 1) {
                            $element.css('display', 'none');
                        } else {
                            $element.css('display', 'block');
                        }
                    }
                });
            }
        };
    })
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    if (value) {
                        return parseFloat(value.replace(',', ''));
                    }
                });
            }
        };
    })
    .directive('errSrc', function () {
        return {
            link: function (scope, element, attrs) {
                element.bind('error', function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.errSrc = "uploads/default/user.jpg";
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    })
    .directive('checkFileSize', function () {
        return {
            link: function (scope, elem, attr, ctrl) {
                $(elem).bind('change', function () {
                    alert('File size:' + this.files[0].size);
                });
            }
        }
    })
    .filter('encodeURIComponent', function ($window) {
        return $window.encodeURIComponent;
    })
    .filter('decodeURIComponent', function ($window) {
        return $window.decodeURIComponent;
    })
    .directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');
                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    })
    .directive('allowOnlyNumbers', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.on('keydown', function (event) {
                    if (event.which == 64 || event.which == 16) {
                        // to allow numbers
                        return false;
                    } else if (event.which >= 48 && event.which <= 57) {
                        // to allow numbers
                        return true;
                    } else if (event.which >= 96 && event.which <= 105) {
                        // to allow numpad number
                        return true;
                    } else if ([8, 13, 27, 37, 38, 39, 40, 9, 110].indexOf(event.which) > -1) {
                        // to allow backspace, enter, escape, arrows
                        return true;
                    } else {
                        event.preventDefault();
                        // to stop others
                        return false;
                    }
                });
            }
        }
    })
    .directive('scroll', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                scope.$watchCollection(attr.scroll, function (newVal) {
                    $timeout(function () {
                        element[0].scrollTop = element[0].scrollHeight;
                    });
                });
            }
        }
    })
    .directive('lazyerr', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                return attrs.$observe("afklLazyImageLoaded", function (value) { });
            }
        };
    })
    .directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).hover(function () {
                    // on mouseenter
                    //    $(element).tooltip('show');
                }, function () {
                    // on mouseleave
                    //    $(element).tooltip('hide');
                });
            }
        };
    })
    .directive('disallowSpaces', function () {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $element.bind('input', function () {
                    $(this).val($(this).val().replace(/ /g, ''));
                });
            }
        };
    });
