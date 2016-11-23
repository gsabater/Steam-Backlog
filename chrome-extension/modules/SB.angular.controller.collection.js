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

angular.module('SB.controllers')

//=================================================
// CollectionsCtrl
// + Function to check the active state and apply
//=================================================
  .controller('CollectionsCtrl', function($rootScope, $scope, Games){

    $scope.showPanel = false;

  //| Init controller when storage.local is ready and the
  //| db is loaded in rootScope.
  //+-------------------------------------------------------
    $rootScope.$watch('app.showCollectionsPanel', function(){
      if($rootScope.app.showCollectionsPanel === true){
        $rootScope.app.backdrop = true;
        $scope.showPanel = true; }
    });

  //| closePanel
  //| Hide panel and reset inputs
  //+-------------------------------------------------------
    $scope.closePanel = function(apply){
      $rootScope.app.showCollectionsPanel = false;
      $rootScope.app.backdrop = false;
      $scope.showPanel = false;
      if(apply){ $scope.$apply(); }
    };

      //| delete
      //| Removes a collection
      //+-------------------------------------------------------
        $scope.delete = function(){
          var conf = confirm("Do you really want to reset all DB? This cannot be undone.");
          if (conf ===false){ return false; }

          var url = user.info.profileurl;
          isQueue = true;

          chrome.storage.local.remove("db",    function(){console.error("removed"); });
          chrome.storage.local.remove("user",    function(){console.error("removed"); });
          chrome.storage.local.remove("settings",    function(){console.error("removed"); });

          window.setTimeout(function(){ window.location.href = url; }, 1000);
        };

  });
