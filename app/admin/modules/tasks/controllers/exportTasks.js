angular.module('quickRabbit.tasks').controller('exportTasksCtrl', exportTasksCtrl);

exportTasksCtrl.$inject = ['TasksExportReslove', 'TasksService', 'toastr', '$state', '$window'];

function exportTasksCtrl(TasksExportReslove, TasksService, toastr, $state, $window) {
    var edttc = this;
    edttc.editTasksData = TasksExportReslove[0];
    $state.go('app.tasks.viewsTasks');
    $window.location.href = TasksExportReslove;
}
