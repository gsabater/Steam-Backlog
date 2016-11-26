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
  //| applyDefaults values and also saves object
  //+-------------------------------------------------------
    $rootScope.$watch('collections', function(){
      if($rootScope.collections === false){
        $scope.applyDefaults();
        $scope.saveLocal(); }
    });


  //| Listener of rootScope.app.showCollectionsPanel
  //| show window anf focus or set value of input.
  //+-------------------------------------------------------
    $rootScope.$watch('app.showCollectionsPanel', function(){

      if($rootScope.app.showCollectionsPanel === true){
        $scope.showPanel = true;
        $rootScope.app.backdrop = true;

        delete $rootScope.app.editCollectionID;

        window.setTimeout(function(){
          $("input[name='collection_name']").focus(); }, 150);
      }

      if($rootScope.app.showCollectionsPanel === "edit"){
        var item = $rootScope.collections[$rootScope.app.editCollectionID];

        $scope.showPanel = true;
        $rootScope.app.backdrop = true;

        window.setTimeout(function(){
          $("input[name='collection_name']").val(item.name).focus(); }, 150);

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


  //| editCollection
  //| Edits values in a certain collection index
  //| Then save the object in local.storage
  //+-------------------------------------------------------
    $scope.editCollection = function(){

      $rootScope.collections[$rootScope.app.editCollectionID].name = $("input[name='collection_name']").val();

      $scope.closePanel();
      $scope.saveLocal();
    };


  //| addCollection
  //| Adds a new element into collections array
  //| Then save the object in local.storage
  //+-------------------------------------------------------
    $scope.addCollection = function(){

      $rootScope.collections.push({
        name: $scope.collection_name.toString(),
        apps: [] });

      $scope.closePanel();
      $scope.saveLocal();
    };


  //| delete
  //| Removes a collection
  //+-------------------------------------------------------
    $scope.delete = function(){
      var conf = confirm("Do you really want to reset all DB? This cannot be undone.");
      if (conf ===false){ return false; }

      var url = user.info.profileurl;
      isQueue = true;

      chrome.storage.local.remove("db",    function(){console.error("removed"); });
      chrome.storage.local.remove("user",    function(){console.error("removed"); });
      chrome.storage.local.remove("settings",    function(){console.error("removed"); });

      window.setTimeout(function(){ window.location.href = url; }, 1000);
    };


  //| saveLocal
  //| Saves in chrome.local
  //+-------------------------------------------------------
    $scope.saveLocal = function(){

      chrome.storage.local.set({'collections': $rootScope.collections}, function(){
        console.warn("collections saved", $rootScope.collections);
      });

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
