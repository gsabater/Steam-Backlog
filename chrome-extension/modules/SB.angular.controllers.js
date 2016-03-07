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

    //| jQuery Callback
    //+-------------------------------------------------------
      $scope.jQueryCallback = function(){
        $scope.search();
        $scope.$apply();
      };

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
