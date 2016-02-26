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
      window.setTimeout(function(){
        chrome.storage.local.get(null, function(items){

          $rootScope.user = items.user;
          $rootScope.db   = items.db;
          console.log($rootScope);

        });

      }, 50);

      /*
      $rootScope.user = {

        finished: [],
        
        hoursPlayed: 0,
        hoursWeek: 0,
        
      };
      */

    })

  //+-------------------------------------------------------
  //| .config()
  //| + $stateProvider for routes
  //+-------------------------------------------------------
    .config(['$routeProvider',
    function($routeProvider){
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