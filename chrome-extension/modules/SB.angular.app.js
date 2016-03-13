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

  //+-------------------------------------------------------
  //| .run()
  //| + First call in app where start $rootScope
  //| + set memory for games and stats
  //+-------------------------------------------------------
    .run(function($rootScope){

      console.log("+ App start");

    // Get chrome.storage.local
    // And set user and db values got from jQuery
    //=================================================
      chrome.storage.local.get(null, function(items){

        console.log(items);

        db   = items.db;
        user = items.user;

        $rootScope.db   = items.db;
        $rootScope.user = items.user;

        updateDB();

      });


      $rootScope.app = {
        v: 0,
        listStyle: "cards" //table
      };

      $rootScope.backlog = {
        hoursPlayed: 0,
        playing: {},
        finished: {},
        mastered: {},
        shelved: {}
      };

    })

  //+-------------------------------------------------------
  //| .config()
  //| + $stateProvider for routes
  //+-------------------------------------------------------
    .config(['$routeProvider', '$compileProvider',
    function($routeProvider, $compileProvider){

      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|steam):/);

      $routeProvider

        .when('/dashboard', {
          templateUrl: 'partials/dashboard.html',
          controller: 'dashboard'
        })

        .when('/dashboard/:phoneId', {
          templateUrl: 'partials/phone-detail.html',
          controller: 'PhoneDetailCtrl'
        })

        .otherwise({
          redirectTo: '/dashboard'
        });
    }])

;
