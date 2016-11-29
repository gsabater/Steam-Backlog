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
    $scope.collection = false;

  //| Listener of rootScope.collections
  //| applyDefaults values and saves object
  //+-------------------------------------------------------
    $rootScope.$watch('collections', function(){
      if($rootScope.collections === false){
        $scope.applyDefaults();
        $scope.saveLocal(); }
    });


  //| Listener of rootScope.app.showCollectionsPanel
  //| true: show window (new); edit: show window and set value (edit)
  //+-------------------------------------------------------
    $rootScope.$watch('app.showCollectionsPanel', function(){

      if($rootScope.app.showCollectionsPanel === true){
        window.setTimeout(function(){
          $("input[name='collection_name']").focus(); }, 150);

        $scope.showPanel = true;
        $rootScope.app.backdrop = true;
        delete $rootScope.app.editCollectionID;
      }

      if($rootScope.app.showCollectionsPanel === "edit"){
        $scope.collection = $rootScope.collections[$rootScope.app.editCollectionID];
        window.setTimeout(function(){
          $("input[name='collection_name']").val($scope.collection.name).focus(); }, 100);

        $scope.showPanel = true;
        $rootScope.app.backdrop = true;
      }

    });


  //| closePanel
  //| Hide panel and reset inputs
  //| apply param does scope.apply when called from jquery
  //+-------------------------------------------------------
    $scope.closePanel = function(apply){

      $rootScope.app.showCollectionsPanel = false;
      $rootScope.app.backdrop = false;
      $scope.collection = false;
      $scope.showPanel = false;

      delete $rootScope.app.editCollectionID;
      $("input[name='collection_name']").val("");

      if(apply){ $scope.$apply(); }
    };


  //| newedit
  //| reads app.editCollectionID == undefined and
  //| Edits values in a certain collection index
  //| or adds a new item to collections object
  //+-------------------------------------------------------
    $scope.newedit = function(){

      if($rootScope.app.editCollectionID === undefined){
        $rootScope.collections.push({
          name: $scope.collection_name.toString(),
          apps: [],
          hide: $scope.collection.hide});
      }else{
        $scope.collection.name = $("input[name='collection_name']").val();
        $rootScope.collections[$rootScope.app.editCollectionID] = $scope.collection;
      }

      $scope.closePanel();
      $scope.saveLocal();
    };


  //| delete
  //| Removes a collection
  //+-------------------------------------------------------
    $scope.delete = function(){
      var conf = confirm("Do you want to delete this element? This cannot be undone.");
      if (conf ===false){ return false; }

      $rootScope.collections.splice($rootScope.app.editCollectionID, 1);

      $scope.closePanel();
      $scope.saveLocal();
    };


  //| toggleApp
  //| Adds an appID into a collection
  //+-------------------------------------------------------
    $scope.toggleApp = function(appid, collection){

      var item  = $rootScope.collections[collection];
      var index = item.apps.indexOf(appid);

      if(index > -1){ $rootScope.collections[collection].apps.splice(index, 1);
      }else{          $rootScope.collections[collection].apps.push(appid); }

      console.log($rootScope.collections[collection].apps, $rootScope.collections[collection]);
      $scope.saveLocal();

    };


  //| saveLocal
  //| Saves in chrome.local
  //+-------------------------------------------------------
    $scope.saveLocal = function(){
      chrome.storage.local.set({'collections': $rootScope.collections}, function(){
        console.warn("collections saved", $rootScope.collections);  });
    };


  //| applyDefaults()
  //| Initialize rootScope with default values if false
  //+-------------------------------------------------------
    $scope.applyDefaults = function(){
      if($rootScope.collections === false){
        $rootScope.collections = [
          { name: "Favorites", apps: [] },
          { name: "Completed", apps: [] },
          { name: "What to pick next", apps: [] },
          { name: "Hidden games", apps: [], hide: true }
        ];
      }
    };

  });
