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
  .controller('dashboard', function($rootScope, $scope, $location, SteamAPI, Games, Filter){

    console.log("dashboard");
    //NProgress.start();

    $scope.games   = {};
    $scope.filters = {
      string: "",
      tags: []
    };

    //| Initial set of information
    //+-------------------------------------------------------
      window.setTimeout(function(){
        $scope.tags  = Games.getAllTags();
        $scope.games = Filter.games();
        $scope.$apply();
      }, 100);

    //| Search service
    //+-------------------------------------------------------
      $scope.search = function(){
        $scope.games = Filter.games($scope.filters);
      };

/*
    SteamAPI.getPlayer().then(function(xhr){
      console.log("succ",xhr);
      $rootScope.user.info = xhr.data.response.players[0];
    });

    SteamAPI.getGameStats().then(function(xhr){
      console.log("succ",xhr);
      $scope.gameStats = xhr.data.playerstats.achievements;
    });

    SteamAPI.getDynamicStore().then(function(xhr){
      console.log("succ",xhr);
      $scope.dynamic = xhr.data;
    });

/*
    SteamAPI.getHLTB().then(function(xhr){
      console.log("succ HLTB",xhr);
      $scope.HLTB = xhr.data;
    });
    */
/*
    SteamAPI.getGames().then(function(xhr){
      console.log("succ",xhr);

      Games.Analyze(xhr.data.response.games);
      $scope.games = xhr.data.response.games;
      NProgress.done();

    }, function(err){
      // An error occured. Show a message to the user
      console.log("error",err);
    });
    */

    $scope.isItemActive = function(item){
      //console.log("wat", $location.path().indexOf(item) > -1);
      //return $location.path().indexOf(item) > -1;
    };

    $scope.openPopup = function(gameID){
      $scope.app = $rootScope.db[gameID];
      $.magnificPopup.open({
        items: {
          src: '.white-popup',
          type: 'inline'
        }
      });
    }
  })
