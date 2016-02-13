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

angular.module('SB.controllers', []);
angular.module('SB.controllers')

//=================================================
// dashboard
// + Function to check the active state and apply
//=================================================
  .controller('dashboard', function($scope, $location, SteamAPI, Games){

    console.log("dashboard");
    NProgress.start();

    SteamAPI.getGames().then(function(xhr){
      console.log("succ",xhr);

      Games.Analyze(xhr.data.response.games);
      $scope.games = xhr.data.response.games;
      NProgress.done();

    }, function(err){
      // An error occured. Show a message to the user
      console.log("error",err);
    });

    $scope.isItemActive = function(item){
      //console.log("wat", $location.path().indexOf(item) > -1);
      //return $location.path().indexOf(item) > -1;
    };
  })