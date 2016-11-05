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
// BacklogCtrl
// +
//=================================================
  .controller('BacklogCtrl', function($rootScope, $scope, Games, Filter){

    // dbscan is an indicator of currently doing ajax calls
    //$scope.scan = dbScan;

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
      achievements: false,

      limit: 30
    };


    //| Initial function
    //| db is ready, and all tags are gathered.
    //+-------------------------------------------------------
      $scope.init = function(){
        if(!$scope.games){
          console.log("Dashboard init");

          $scope.overview = Games.overview();

          $scope.overview = $scope.overview.games;
          $scope.tags     = $scope.overview.tags;
          $scope.allTags  = $scope.tags;

          $scope.games    = Filter.games($scope.filters).games;
        }
      };


    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.search = function(){
        var filtered = Filter.games($scope.filters);
        $scope.games = filtered.games;
        $scope.tags  = filtered.tags;

        //$scope.filters.limit = 30;
      };


    //| filterTag
    //| Adds a tag to filters and trigger search again
    //+-------------------------------------------------------
      $scope.filterTag = function(tag){

        var position = $scope.filters.tags.indexOf(tag);
        if( position > -1){
          $scope.filters.tags.splice(position,1); }else{
          $scope.filters.tags.push(tag); }

        $scope.search();
      };


    //| loadMore a jQuery called function to
    //| load elements via infinite scroll
    //+-------------------------------------------------------
      $scope.loadMore = function(){
        $scope.filters.limit = $scope.filters.limit + 30;
      };


    //| openDetails
    //+-------------------------------------------------------
      $scope.openDetails = function(gameID){

        var prev = $scope.gameDetails;
        $scope.gameDetails = gameID;
        Games.setApp(gameID);

        $scope.toggleTags = false;

        // Load details on games following the first one
        if(prev !== false){
          $(document.getElementById('game-details')).scope().loadDetails();  }
      };


    //| jQuery Callback
    //| is called when a game has been refreshed in jquery
    //+-------------------------------------------------------
      $scope.jQueryCallback = function(){
        //$scope.search();
        //$scope.allTags = Games.getAllTags();

        $scope.overview = Games.overview();
        $scope.allTags  = $scope.overview.tags;

        $scope.$apply();
      };


    //| Init controller when storage.local is ready and the
    //| db is loaded in rootScope.
    //+-------------------------------------------------------
      $rootScope.$watch('db', function(){
        if($rootScope.db !== undefined){ $scope.init(); }
      });

  })

//=================================================
// gameDetails
// + Function to check the active state and apply
//=================================================
  .controller('gameDetails', function($rootScope, $scope, Games){

    NProgress.configure({
      parent: '.filter-bar',
    });

    $scope.gameStatus = ["Backlog", "Abandoned", "Completed", "Mastered"]; //shelved (abandoned), backlog, completed, mastered, playing

    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.loadDetails = function(){
        $scope.gameDetails = Games.getDetails();

        // The game is still missing
        if(!$scope.gameDetails.updated){
          $scope.refreshGameDetails(); }
      }

    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.refreshGameDetails = function(){
        NProgress.start();
        scrapGame($scope.gameDetails.appid, "updateGameDetails");
      }

    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.updateGameDetails = function(){
        NProgress.done();
      }

    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.saveGameDetails = function(){
        db[$scope.gameDetails.appid] = $scope.gameDetails;
        chrome.storage.local.set({'db': db}, function(){ /* console.warn("db saved", db); */ });
      }

    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.changeStatus = function(newStatus){
        $scope.gameDetails.status = newStatus;
        $scope.saveGameDetails();
      }

    //| Search function
    //| Filter games again because filters have changed
    //+-------------------------------------------------------
      $scope.changeUserStatus = function(status){
        if(!$scope.gameDetails.userStatus || (typeof $scope.gameDetails.userStatus !== "object")){ $scope.gameDetails.userStatus = {}; }
        $scope.gameDetails.userStatus[status] = !$scope.gameDetails.userStatus[status];

        $scope.saveGameDetails();
      }

    $scope.loadDetails();

  })

//=================================================
// ProgressCtrl
// + Function to check the active state and apply
//=================================================
  .controller('ProgressCtrl', function($rootScope, $scope, Games){

    $scope.filters = {


      limit: 12
    };

    $scope.overview = Games.overview();
    $scope.overview = $scope.overview.games;

  })

//=================================================
// OptionsCtrl
// + Function to check the active state and apply
//=================================================
  .controller('OptionsCtrl', function($rootScope, $scope, Games){

    //background = Games.getRandomGame();
    //$scope.background = background.appid;

    //| Save Options
    //| Updates chrome.local with the options settings.
    //+-------------------------------------------------------
      $scope.saveOptions = function(){
        db[$scope.gameDetails.appid] = $scope.gameDetails;
        chrome.storage.local.set({'db': db}, function(){ /* console.warn("db saved", db); */ });
      }

  })

//=================================================
// DashboardCtrl
// +
//=================================================
  .controller('DashboardCtrl', function($rootScope, $scope){

  })

//=================================================
// AboutCtrl
// + Function to check the active state and apply
//=================================================
  .controller('AboutCtrl', function($rootScope, $scope){

  })
