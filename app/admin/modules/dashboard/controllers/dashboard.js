angular.module('quickRabbit.dashboard').controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['UsersService', 'toastr', 'TasksService', 'TaskersService', 'userCountServiceResolve', 'getRecentUsersResolve', 'getRecentTaskersResolve', 'getRecentTasksResolve', 'DashboardService', '$scope', '$modal', '$state', '$stateParams', 'TasksServiceResolve', 'earningsServiceResolve', '$filter'];

function DashboardCtrl(UsersService, toastr, TasksService, TaskersService, userCountServiceResolve, getRecentUsersResolve, getRecentTaskersResolve, getRecentTasksResolve, DashboardService, $scope, $modal, $state, $stateParams, TasksServiceResolve, earningsServiceResolve, $filter) {

    var dlc = this;
    dlc.tasks = getRecentTasksResolve[0];
    dlc.users = userCountServiceResolve[0];
    dlc.taskers = getRecentTaskersResolve[0];

    var layout = [
        {
            name: 'Booking ID',
            variable: 'booking_id',
            template: '{{content.booking_id}}',
            sort: 1
        },
        {
            name: 'Task Date',
            variable: 'task_date',
            template: '{{content.task_date}}',
            sort: 1
        },
        {
            name: 'Username',
            variable: 'username',
            template: '{{content.user[0].username}}',
            sort: 1
        },
        {
            name: 'Status ',
            template: '<span ng-switch="content.status">' +
            '<span  ng-switch-when="0">Delete</span>' +
            '<span  ng-switch-when="1">Onprogress</span>' +
            '<span  ng-switch-when="3">Accepted</span>' +
            '<span  ng-switch-when="4">StartOff</span>' +
            '<span  ng-switch-when="5">Arrived</span>' +
            '<span  ng-switch-when="6">Completed</span>' +
            '<span  ng-switch-when="7">Completed</span>' +
            '<span  ng-switch-when="8">Cancelled</span>' +
            '<span  ng-switch-when="9">Dispute</span>' +
            '<span  ng-switch-when="10">Search</span>' +
            '</span>'

        },
    ];

    dlc.table = {};
    dlc.table.layout = layout;
    dlc.table.data = getRecentTasksResolve[0];
    dlc.table.count = getRecentTasksResolve[1] || 0;
    dlc.table.delete = {
        service: '/slider/deletebanner', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            DashboardService.getRecentTasks(itemsPerPage, skip, sort, status, search).then(function (respo) {
                dlc.table.data = respo[0];
                dlc.table.count = respo[1];
            });
        }
    };

    $scope.refMonth = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    $scope.monthArrayObj = [[1, 'JAN'], [2, 'FEB'], [3, 'MAR'], [4, 'APR'], [5, 'MAY'], [6, 'JUN'], [7, 'JUL'], [8, 'AUG'], [9, 'SEP'], [10, 'OCT'], [11, 'NOV'], [12, 'DEC']];

    $scope.currentMonth = new Date().getMonth() + 1;
    $scope.newMonthArray = [];
    for (var i = 0, k = $scope.currentMonth; i < $scope.monthArrayObj.length; i++ , k++) {
        if (k >= $scope.refMonth.length) {
            $scope.monthArrayObj[i][1] = $scope.refMonth[i - ($scope.refMonth.length - $scope.currentMonth)];
        } else {
            $scope.monthArrayObj[i][1] = $scope.refMonth[k];
        }
    }

    $scope.convertedData = {
        orderCount: [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0]],
        orderAmount: [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0]],
        monthArray: []
    };

    UsersService.getAllUsers(0, 10, 0).then(function (data) {
        if (data[2]) {
            $scope.userlist = data[2].allValue || 0;
        }
        else {
            $scope.userlist = 0;
        }
    });
    DashboardService.getRecentUsers().then(function (data) {
        $scope.RecentUsers = data;
    });

    DashboardService.getTaskDetails().then(function (data) {
        $scope.taskDetails = data;
    });

    DashboardService.getTaskerDetails().then(function (data) {
        $scope.taskersDetails = data;
    });

    DashboardService.getverifiedTaskerDetails().then(function (data) {
        $scope.verifiedtaskersDetails = data;
    });

    DashboardService.getTaskers().then(function (data) {
        $scope.taskers = data[1];
    });


    if (TasksServiceResolve) {
        $scope.tasks = TasksServiceResolve[0].length || 0;
    }

    DashboardService.getCategoryList().then(function (data) {
        $scope.categorylist = data[1];
    });

    DashboardService.getAllearnings().then(function (data) {
        $scope.earnings = (data.data[0]).toFixed(2);
    });

    DashboardService.getAllearnings().then(function (data) {
        $scope.earningsadmin = (data.data[1]).toFixed(2);
    });
    DashboardService.getAllearnings().then(function (data) {
        $scope.coupons = (data.data[2]).toFixed(2);
    });
    DashboardService.getAllearnings().then(function (data) {
        $scope.subscriber = data.data[3];
    });

    dlc.updateuser = function () {
        DashboardService.getRecentUsers().then(function (data) {
            $scope.RecentUsers = data;
        });
    }

    dlc.approvtaskerss = function () {
        DashboardService.getTaskerDetails().then(function (data) {
            $scope.taskersDetails = data;
        });
    }

    DashboardService.getdefaultcurrency().then(function (data) {
        $scope.getdefaultcurrency = data;
    });


    $scope.datasetStat = [{
        data: $scope.convertedData.orderAmount,
        label: 'Order Sale Amount',
        bars: {
            show: true,
            barWidth: 0.6,
            lineWidth: 0,
            fillColor: { colors: [{ opacity: 0.3 }, { opacity: 0.8 }] }
        }
    }, {
        data: $scope.convertedData.orderCount,
        label: 'Dispute Amount',
        points: {
            show: true,
            radius: 6
        },
        splines: {
            show: true,
            tension: 0.45,
            lineWidth: 5,
            fill: 0
        }
    }];
    $scope.optionsStat = {
        colors: ['#e05d6f', '#61c8b8'],
        series: {
            shadowSize: 0
        },
        legend: {
            backgroundOpacity: 0,
            margin: -7,
            position: 'ne',
            noColumns: 2
        },
        xaxis: {
            tickLength: 0,
            font: {
                color: '#fff'
            },
            position: 'bottom',
            ticks: $scope.monthArrayObj
        },
        yaxis: {
            tickLength: 0,
            font: {
                color: '#fff'
            },
            position: 'left',
            ticks: [1000, 2000, 3000, 4000, 5000]
        },
        grid: {
            borderWidth: {
                top: 0,
                right: 0,
                bottom: 1,
                left: 1
            },
            borderColor: 'rgba(255,255,255,.3)',
            margin: 0,
            minBorderMargin: 0,
            labelMargin: 20,
            hoverable: true,
            clickable: true,
            mouseActiveRadius: 6
        },
        tooltip: true,
        tooltipOpts: {
            content: '%s: %y',
            defaultTheme: true,
            shifts: {
                x: 0,
                y: 20
            }
        }
    };

    /*[200,400,600,800,1000,1200,1400]*/
    $scope.dataset = [];
    $scope.options = {
        series: {
            pie: {
                show: true,
                innerRadius: 0,
                stroke: {
                    width: 0
                },
                label: {
                    show: true,
                    threshold: 0.05
                }
            }
        },
        colors: ['#428bca', '#5cb85c', '#f0ad4e', '#d9534f', '#5bc0de', '#616f77'],
        grid: {
            hoverable: true,
            clickable: true,
            borderWidth: 0,
            color: '#ccc'
        },
        tooltip: true,
        tooltipOpts: { content: '%s: %p.0%' }
    };

    dlc.deleteuser = function (id) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'app/admin/modules/dashboard/views/deleteuser.modal.tab.html',
            controller: 'DeleteUserModalInstanceCtrl',
            controllerAs: 'DCMIC',
            resolve: {
                user: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (id) {
            DashboardService.deleteUser(id).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Error');
                }
                else {
                    dlc.updateuser();
                    toastr.success('success', 'Deleted Successfully');

                }

            });
        });
    }
    dlc.approvtasker = function (id, status) {
        DashboardService.approvTasker(id, status).then(function (response) {
            if (response.code == 11000) {
                toastr.error('Error');
            }
            else {
                if (response.data.status == 1) {
                    dlc.approvtaskerss();
                    toastr.success('success', 'Approved Successfully');
                }
                else if (response.data.status == 2) {
                    dlc.approvtaskerss();
                    toastr.success('success', 'UnPublish Successfully');
                }

            }
        });
    }
    dlc.edit = function (taskerid) {
        $state.go('app.taskers.edit', ({ id: taskerid }));
    }
    dlc.edituser = function (userid) {
        $state.go('app.users.add', ({ id: userid }));
    }
    dlc.viewtask = function (taskid) {
        $state.go('app.tasks.add', ({ id: taskid }));
    }


    // Earinings Charts Details

    // DashboardService.earningsDetails().then(function (data) {
    //     $scope.earningsDetails = data;
    // });
    $scope.earningsDetails = earningsServiceResolve;
    $scope.adminlist = [];
    $scope.taskslist = [];
    $scope.xaxis_list = [];
    var i = 12;
    var costLine = $scope.earningsDetails.response.earnings.filter(function (admin) {
        $scope.adminlist.push([i, admin.admin_earnings]);
        $scope.taskslist.push([i, admin.amount]);
        $scope.xaxis_list.push([i, admin.month]);
        i--;
        return admin;
    })

    $scope.dataset = [{

        data: $scope.adminlist,
        // data: [],
        label: 'Admin Earnings',
        points: {
            show: true, // points
            radius: 6
        },
        splines: {
            show: true,
            // tension: 0.45,
            lineWidth: 3,
            tension: 0.001,
            fill: 0
        }
    }, {
        // data: [[1,6.6],[2,7.4],[3,8.6],[4,9.4],[5,8.3],[6,7.9],[7,7.2],[8,7.7],[9,8.9],[10,8.4],[11,8],[12,8.3]],
        data: $scope.taskslist,
        label: 'Total task Amount',
        points: {
            show: true,
            radius: 6
        },
        splines: {
            show: true,
            tension: 0.001,
            // tension: 0.45,
            lineWidth: 3,
            fill: 0
        }
    }];

    $scope.options = {
        colors: ['#004687', '#BCCF02'],
        series: {
            shadowSize: 0
        },
        xaxis: {
            font: {
                color: '#ccc'
            },
            position: 'bottom',
            // ticks: [
            //   [ 1, 'Jan' ], [ 2, 'Feb' ], [ 3, 'Mar' ], [ 4, 'Apr' ], [ 5, 'May' ], [ 6, 'Jun' ], [ 7, 'Jul' ], [ 8, 'Aug' ], [ 9, 'Sep' ], [ 10, 'Oct' ], [ 11, 'Nov' ], [ 12, 'Dec' ]
            // ]
            ticks: $scope.xaxis_list
        },
        yaxis: {
            font: {
                color: '#ccc'
            }
        },
        grid: {
            hoverable: true,
            clickable: true,
            borderWidth: 0,
            color: '#ccc'
        },
        tooltip: true,
        tooltipOpts: {
            content: '%s.: %y.4',
            defaultTheme: false,
            shifts: {
                x: 0,
                y: 20
            }
        }
    };

}
angular.module('quickRabbit.taskers').controller('DeleteUserModalInstanceCtrl', function ($modalInstance, user) {
    var dcmic = this;
    dcmic.userid = user;
    dcmic.ok = function () {
        $modalInstance.close(dcmic.userid);
    };
    dcmic.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
/*
app.controller('ActualStatisticsCtrl', function ($scope) {
    $scope.easypiechart = {
        percent: 100,
        options: {
            animate: {
                duration: 3000,
                enabled: true
            },
            barColor: '#418bca',
            scaleColor: false,
            lineCap: 'round',
            size: 140,
            lineWidth: 4
        }
    };
    $scope.easypiechart2 = {
        percent: 100,
        options: {
            animate: {
                duration: 3000,
                enabled: true
            },
            barColor: '#e05d6f',
            scaleColor: false,
            lineCap: 'round',
            size: 140,
            lineWidth: 4
        }
    };
    $scope.easypiechart3 = {
        percent: 100,
        options: {
            animate: {
                duration: 3000,
                enabled: true
            },
            barColor: '#16a085',
            scaleColor: false,
            lineCap: 'round',
            size: 140,
            lineWidth: 4
        }
    };
})
*/
/*

    .controller('BrowseUsageCtrl', function ($scope) {

        $scope.donutData = [
            { label: 'Chrome', value: 25, color: '#00a3d8' },
            { label: 'Safari', value: 20, color: '#2fbbe8' },
            { label: 'Firefox', value: 15, color: '#72cae7' },
            { label: 'Opera', value: 5, color: '#d9544f' },
            { label: 'Internet Explorer', value: 10, color: '#ffc100' },
            { label: 'Other', value: 25, color: '#1693A5' }
        ];

        $scope.oneAtATime = true;

        $scope.status = {
            isFirstOpen: true,
            tab1: {
                open: true
            },
            tab2: {
                open: false
            },
            tab3: {
                open: false
            }
        };

    })
    */

/*
    .controller('RealtimeLoadCtrl', function ($scope, $interval) {

        $scope.options1 = {
            renderer: 'area',
            height: 133
        };

        $scope.seriesData = [[], []];
        var random = new Rickshaw.Fixtures.RandomData(50);

        for (var i = 0; i < 50; i++) {
            random.addData($scope.seriesData);
        }

        var updateInterval = 800;

        $interval(function () {
            random.removeData($scope.seriesData);
            random.addData($scope.seriesData);
        }, updateInterval);

        $scope.series1 = [{
            name: 'Series 1',
            color: 'steelblue',
            data: $scope.seriesData[0]
        }, {
            name: 'Series 2',
            color: 'lightblue',
            data: $scope.seriesData[1]
        }];

        $scope.features1 = {
            hover: {
                xFormatter: function (x) {
                    return new Date(x * 1000).toUTCString();
                },
                yFormatter: function (y) {
                    return Math.floor(y) + '%';
                }
            }
        };
    })
    */

/*
    .controller('ProjectProgressCtrl', function ($scope, DTOptionsBuilder, DTColumnDefBuilder) {
        $scope.projects = [{
            title: 'Graphic layout for client',
            priority: {
                value: 1,
                title: 'High Priority'
            },
            status: 42,
            chart: {
                data: [1, 3, 2, 3, 5, 6, 8, 5, 9, 8],
                color: '#cd97eb'
            }
        }, {
            title: 'Make website responsive',
            priority: {
                value: 3,
                title: 'Low Priority'
            },
            status: 89,
            chart: {
                data: [2, 5, 3, 4, 6, 5, 1, 8, 9, 10],
                color: '#a2d200'
            }
        }, {
            title: 'Clean html/css/js code',
            priority: {
                value: 1,
                title: 'High Priority'
            },
            status: 23,
            chart: {
                data: [5, 6, 8, 2, 1, 6, 8, 4, 3, 5],
                color: '#ffc100'
            }
        }, {
            title: 'Database optimization',
            priority: {
                value: 2,
                title: 'Normal Priority'
            },
            status: 56,
            chart: {
                data: [2, 9, 8, 7, 5, 9, 2, 3, 4, 2],
                color: '#16a085'
            }
        }, {
            title: 'Database migration',
            priority: {
                value: 3,
                title: 'Low Priority'
            },
            status: 48,
            chart: {
                data: [3, 5, 6, 2, 8, 9, 5, 4, 3, 2],
                color: '#1693A5'
            }
        }, {
            title: 'Email server backup',
            priority: {
                value: 2,
                title: 'Normal Priority'
            },
            status: 10,
            chart: {
                data: [7, 8, 6, 4, 3, 5, 8, 9, 10, 7],
                color: '#3f4e62'
            }
        }];

        $scope.dtOptions = DTOptionsBuilder.newOptions().withBootstrap();
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0),
            DTColumnDefBuilder.newColumnDef(1),
            DTColumnDefBuilder.newColumnDef(2),
            DTColumnDefBuilder.newColumnDef(3),
            DTColumnDefBuilder.newColumnDef(4).notSortable()
        ];
    })
    */