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

  var SB = angular.module('SB', [
    'ngRoute',
    'SB.controllers',
    'SB.services',
    'SB.filters',
    'ui.sortable'
    //'pascalprecht.translate',
  ])

//==============================================================
//| .run()
//| + First call in app where start $rootScope
//| + set memory for games and stats
//==============================================================
  .run(function($rootScope){

    console.log("%c Steam Backlog - Dashboard initialized ", 'background: #222; color: #bada55');

    $rootScope.app = {
      v: 0,
      backdrop: false,
      listStyle: "cards",  // - list
      showCollectionsPanel: false
    };

  // chrome.storage.local.get
  // Set main vars into rootscope
  //+-------------------------------------------------------
    chrome.storage.local.get(null, function(items){

      console.log("Steam Backlog - chrome.storage.local", items);

      db             = items.db;
      user           = items.user;

      local_collections = (items.collections) ? items.collections : collections;
      local_settings    = (items.settings) ? items.settings : settings;

      // apply default settings
      if(!local_settings.hasOwnProperty("library")){ local_settings.library = settings.library; }

      $rootScope.db       = items.db;
      $rootScope.user     = items.user;

      $rootScope.collections = local_collections;
      $rootScope.settings    = local_settings;

      settings    = $rootScope.settings;
      collections = $rootScope.collections;

      $rootScope.app.v = v;

      console.log("DB update", v);
      updateDB();

    });

  })

//==============================================================
//| .config()
//| + $stateProvider for routes
//==============================================================
  .config(['$routeProvider', '$compileProvider',
  function($routeProvider, $compileProvider){

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|steam):/);
    $routeProvider

      .when('/dashboard', {
        templateUrl: 'partials/dashboard.html',
        controller: 'DashboardCtrl'
      })

      .when('/backlog', {
        templateUrl: 'partials/backlog.html',
        controller: 'BacklogCtrl'
      })

      .when('/backlog/:specialFilter', {
        templateUrl: 'partials/backlog.html',
        controller: 'BacklogCtrl'
      })

      .when('/backlog/collection/:collectionID', {
        templateUrl: 'partials/backlog.html',
        controller: 'BacklogCtrl'
      })

      .when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsCtrl'
      })

      .when('/about', {
        templateUrl: 'partials/about.html',
        controller: 'AboutCtrl'
      })

      .otherwise({
        redirectTo: '/backlog'
      });
  }])
;
