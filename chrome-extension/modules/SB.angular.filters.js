//=================================================================
//
//  ██████╗  █████╗  ██████╗██╗  ██╗██╗      ██████╗  ██████╗
//  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██║     ██╔═══██╗██╔════╝
//  ██████╔╝███████║██║     █████╔╝ ██║     ██║   ██║██║  ███╗
//  ██╔══██╗██╔══██║██║     ██╔═██╗ ██║     ██║   ██║██║   ██║
//  ██████╔╝██║  ██║╚██████╗██║  ██╗███████╗╚██████╔╝╚██████╔╝
//  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝
//
//=================================================================

angular.module('SB.filters', [])

  //| getAllTags
  //| Returns an array of all tags found in
  //+---------------------------------------
    .filter('minutesToHours', function(){
      return function(minutes){
        var hours = minutes / 60;
        //var remaining = minutes - (hours.toFixed(0) * 60);
        return hours.toFixed(0) + "h";// " + remaining + "'";
      };
    })

  //| getAllTags
  //| Returns an array of all tags found in
  //+---------------------------------------
    .directive('scrollPosition', function($window){
      return {
        scope: {
          scroll: '=scrollPosition'
        },
        link: function(scope, element, attrs) {
          var windowEl = $($window);
          var handler = function() {
            scope.scroll = windowEl.scrollTop();
          }
          windowEl.on('scroll', scope.$apply.bind(scope, handler));
          handler();
        }
      };
    })
;