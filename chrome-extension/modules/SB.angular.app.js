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
      listStyle: "cards" // - list
    };

    $rootScope.stats = {
      hoursPlayed: 0
    };

  // chrome.storage.local.get
  //+-------------------------------------------------------
    chrome.storage.local.get(null, function(items){

      console.log("chrome.storage", items);

      db   = items.db;
      user = items.user;

      $rootScope.db   = items.db;
      $rootScope.user = items.user;

      console.log("stopped DB update");
      return false;
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

      .when('/progress', {
        templateUrl: 'partials/progress.html'
        //controller: 'ProgressCtrl'
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
        redirectTo: '/dashboard'
      });
  }])
;

/*
.when('/dashboard/:phoneId', {
  templateUrl: 'partials/phone-detail.html',
  controller: 'PhoneDetailCtrl'
})
*/
