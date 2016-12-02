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
  .controller('BacklogCtrl', function($rootScope, $scope, $routeParams, Games, Filter){

    $scope.showTags     = false;
    $scope.showGameCard = false;
    $scope.gameDetails  = false;

    $scope.queue           = queue;
    //$scope.notification    = notification;
    $scope.scanningLibrary = false;

    $scope.filters = {

      collection : false,
      specialFilter : false,

      tags: [],
      searchTags: "",

      string: "",
      orderBy: "-playtime_forever",

      singlePlayer: false,
      multiPlayer:  false,
      coop:         false,
      mmo:          false,
      controller:   false,
      achievements: false,

      limit: 50
    };


    if($routeParams.collectionID){
      $scope.filters.collection = $routeParams.collectionID; }

    if($routeParams.specialFilter){
      $scope.filters.specialFilter = $routeParams.specialFilter; }


    //| init()
    //| Init scope vars from db information
    //+-------------------------------------------------------
      $scope.init = function(){
        console.log("backlog: init()");

        if(!$scope.games){
          $scope.overview = Games.overview();
          $scope.tags     = $scope.overview.tags;
          $scope.allTags  = $scope.tags;
          $scope.games    = Filter.games($scope.filters).games;

          $scope.numGames = $scope.games.length;
        }

        setAppMargin();
      };


    //| Search()
    //| Update scope vars when filter change
    //+-------------------------------------------------------
      $scope.search = function(){
        console.log("backlog: search()");

        var filtered = Filter.games($scope.filters);
        $scope.games = filtered.games;
        $scope.tags  = filtered.tags;

        $scope.filters.limit = 50;
        $(".container").scrollTop(0);

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


    //| openGameCard
    //+-------------------------------------------------------
      $scope.openGameCard = function(gameID){

        $scope.showGameCard = true;
        $rootScope.app.backdrop = true;

        var prev = $scope.gameDetails;
        $scope.gameDetails = gameID;
        Games.setApp(gameID);

        $scope.toggleTags = false;

        // Load details on games following the first one
        if(prev !== false){
          $(document.getElementById('SB-game-card')).scope().loadDetails();  }
      };


      //| scanLibrary
      //| ececute scanlibrary() from module.user
      //+-------------------------------------------------------
        $scope.scanLibrary = function(){
          $scope.scanningLibrary = true;
          scanLibrary();
        };


    //| jQuery Callback
    //| is called when a game has been refreshed in jquery
    //+-------------------------------------------------------
      $scope.jQueryCallback = function(force){

        $scope.overview = Games.overview();
        $scope.allTags  = $scope.overview.tags;

        $scope.scanningLibrary = false;
        $scope.$apply();

        if(force){ $scope.search(); }
      };


    //| loadMore a jQuery called function to
    //| load elements via infinite scroll
    //+-------------------------------------------------------
      $scope.loadMore = function(){
        console.log("Load more games", $scope.filters.limit);
        $scope.filters.limit = $scope.filters.limit + 50;
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

    //| loadDetails
    //| Fetch game information from db
    //+-------------------------------------------------------
      $scope.loadDetails = function(){
        $scope.gameDetails = Games.getDetails();
        console.log($scope.gameDetails);
      };


    //| refreshGameDetails
    //| Fetch the data again from the internet
    //+-------------------------------------------------------
      $scope.refreshGameDetails = function(){
        NProgress.configure({
          parent: '#SB-game-card',
          showSpinner: false
        });
        NProgress.start();
        getGameInfo($scope.gameDetails.appid);
      };


    //| updateGameDetails
    //| Called when refreshGameDetails has completed
    //+-------------------------------------------------------
      $scope.updateGameDetails = function(){
        NProgress.done();
      };


    //| toggleCollection
    //| apply hidden attr to true and save
    //+-------------------------------------------------------
      $scope.toggleCollection = function(appid, collection){
        $("#SB-collection").scope().toggleApp(appid, collection);
      };


    $scope.loadDetails();

  })


//=================================================
// SettingsCtrl
// + Function to check the active state and apply
//=================================================
  .controller('SettingsCtrl', function($rootScope, $scope, Games){

    $scope.scan    = $rootScope.settings.scan;
    $scope.library = $rootScope.settings.library;


    //| Save Settings
    //| Updates chrome.local with settings
    //+-------------------------------------------------------
      $scope.saveSettings = function(){

        $rootScope.settings.scan    = $scope.scan;
        $rootScope.settings.library = $scope.library;

        settings = $rootScope.settings;
        chrome.storage.local.set({'settings': $rootScope.settings}, function(){
          console.warn("settings saved", "rootscope ", $rootScope.settings);
          console.log("rootscope", $rootScope.settings);
          console.log("local", settings);
        });
      };

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
          chrome.storage.local.remove("collections",    function(){console.error("removed"); });

          window.setTimeout(function(){ window.location.href = url; }, 1000);
        };

  })

//=================================================
// DashboardCtrl
// +
//=================================================
  .controller('DashboardCtrl', function($rootScope, $scope){

  })

  //=================================================
  // NavCtrl
  // +
  //=================================================
    .controller('NavCtrl', function($rootScope, $scope){

      $scope.sortableOptions = {
        update: function(e, ui) {
          window.setTimeout(function(){
            $("#SB-collection").scope().saveLocal();
          }, 200);
        },
        axis: 'y',
        handle: '.drag',
      };

    })

//=================================================
// AboutCtrl
// + Function to check the active state and apply
//=================================================
  .controller('AboutCtrl', function($rootScope, $scope){

  });
