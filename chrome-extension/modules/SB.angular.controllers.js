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

    $scope.toggleTags = false;

    $scope.filters = {
      string: "",
      tags: [],
      orderBy: "-playtime_forever"
    };

    //| Initial set of information
    //+-------------------------------------------------------
      window.setTimeout(function(){
        $scope.tags    = Games.getAllTags();
        $scope.allTags = $scope.tags;
        $scope.games   = Filter.games($scope.filters).games;
        $scope.$apply();
      }, 100);

    //| Search service
    //+-------------------------------------------------------
      $scope.search = function(){
        var filtered = Filter.games($scope.filters);
        $scope.games = filtered.games;
        $scope.tags  = filtered.tags;
      };

    //| Apply tag and search
    //+-------------------------------------------------------
      $scope.filterTag = function(tag){

        var position = $scope.filters.tags.indexOf(tag);
        if( position > -1){ 
          $scope.filters.tags.splice(position,1); }else{
          $scope.filters.tags.push(tag); }

        $scope.search();
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
