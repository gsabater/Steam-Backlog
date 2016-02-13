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
    .run(function($rootScope){ // localstorage

      console.log("+ App start");

      $rootScope.app = {
        v: 0.9
      };

      $rootScope.user = {
        finished: [],
        hoursPlayed: 0,
        hoursWeek: 0,
      };

      $rootScope.db = {
        games : [],
      };
/*
      // Get Localstorage de usuario
      // Set object with default values if its first run
      //=================================================
        var user = localstorage.getObject('user');

        if(user.lang){
          user.entradas++;

          //Añadir ajustes extra a localstorage
          if(!user.EMT && user.EMT !== false){ user.EMT = true; }
          if(!user.update){ user.update = 0; } //no timestamp
          if(!user.elTiempo && user.elTiempo !== false){ user.elTiempo = true; }

          $rootScope.user = user;
          localstorage.setObject('user', user);

          console.log("+ App: user",user);
        }else{ localstorage.setObject('user', $rootScope.user); }
        
        //$translate.use($rootScope.user.lang); 
        //console.log($translate.use());

      // Get Localstorage de paradas guardadas
      //=================================================
        var favoritos = localstorage.getObject('favoritos');
        $rootScope.db.favoritos = (favoritos.length > 0)? favoritos : [];
        //console.log("+ localstorage: Favoritos", $rootScope.db.favoritos);

      // Get Localstorage de ultimas paradas vistas
      //=================================================
        var recientes = localstorage.getObject('recientes');
        $rootScope.db.recientes = (recientes.length > 0)? recientes : [];
        //console.log("+ localstorage: recientes", $rootScope.db.recientes);

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
          templateUrl: 'partials/phone-list.html',
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