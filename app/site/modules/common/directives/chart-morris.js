angular.module('quickRabbit.admin')
  .directive('morrisDonutChart', function(){
    return {
      restrict: 'A',
      scope: {
        donutData: '=',
        donutColors: '@'
      },
      link: function(scope, elem, attrs){
        var colors,
            morris;
        if (scope.donutColors === void 0 || scope.donutColors === '') {
          colors = null;
        } else {
          colors = JSON.parse(scope.donutColors);
        }

        scope.$watch('donutData', function(){
          if(scope.donutData){
            if(!morris) {
              morris = new Morris.Donut({
                element: elem,
                data: scope.donutData,
                colors: colors || ['#0B62A4', '#3980B5', '#679DC6', '#95BBD7', '#B0CCE1', '#095791', '#095085', '#083E67', '#052C48', '#042135'],
                resize: true
              });
            } else {
              morris.setData(scope.donutData);
            }
          }
        });
      }
    };
  });
