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
    console.error("yeee");

      //| Reset Data
      //| Removes all info
      //+-------------------------------------------------------
        $scope.resetData = function(){
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
