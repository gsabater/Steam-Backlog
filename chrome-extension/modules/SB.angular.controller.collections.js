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

  //| Listener of rootScope.collections
  //| applyDefaults values and saves object
  //+-------------------------------------------------------
    $rootScope.$watch('collections', function(){
      if($rootScope.collections === false){
        $scope.applyDefaults();
        $scope.saveLocal(); }
    });


  //| Listener of rootScope.app.showCollectionsPanel
  //| true: show window; edit: show window and set value
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
        var item = $rootScope.collections[$rootScope.app.editCollectionID];
        window.setTimeout(function(){
          $("input[name='collection_name']").val(item.name).focus(); }, 100);

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
          apps: [] });
      }else{
        $rootScope.collections[$rootScope.app.editCollectionID].name = $("input[name='collection_name']").val();
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
          { name: "What to pick next", apps: [] }
        ];
      }
    };

  });
