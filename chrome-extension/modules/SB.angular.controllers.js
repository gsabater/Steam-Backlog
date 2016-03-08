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

    $scope.scroll = 0;
    $scope.toggleTags  = false;
    $scope.gameDetails = false;

    $scope.filters = {
      tags: [],
      string: "",
      orderBy: "-playtime_forever",

      singlePlayer: false,
      multiPlayer: false,
      coop: false,
      mmo: false,
      controller: false,
      achievements: false
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

    //| jQuery Callback
    //+-------------------------------------------------------
      $scope.jQueryCallback = function(){
        $scope.search();
        $scope.$apply();
      };

    //| openDetails
    //+-------------------------------------------------------
      $scope.openDetails = function(gameID){
        
        var prev = $scope.gameDetails;
        $scope.gameDetails = gameID;
        Games.setApp(gameID);
        
        if(prev !== false){
          $(document.getElementById('game-details')).scope().loadDetails();  }
      }
  })

//=================================================
// gameDetails
// + Function to check the active state and apply
//=================================================
  .controller('gameDetails', function($rootScope, $scope, Games){

    $scope.loadDetails = function(){
      $scope.gameDetails = Games.getDetails();
    }

    $scope.loadDetails();

    console.warn("?",$scope.gameDetails);

  })