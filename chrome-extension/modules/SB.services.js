//=================================================================
//
//  ██████╗  ██████╗ ███╗   ██╗██████╗  █████╗    ███████╗███████╗
//  ██╔══██╗██╔═══██╗████╗  ██║██╔══██╗██╔══██╗   ██╔════╝██╔════╝
//  ██████╔╝██║   ██║██╔██╗ ██║██║  ██║███████║   █████╗  ███████╗
//  ██╔══██╗██║   ██║██║╚██╗██║██║  ██║██╔══██║   ██╔══╝  ╚════██║
//  ██████╔╝╚██████╔╝██║ ╚████║██████╔╝██║  ██║██╗███████╗███████║
//  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
//  
//=================================================================
//  http://bonda.es - FROM MALLORCA WITH LOVE
//=================================================================

angular.module('SB.services', [])

//=================================================
// $http calls
//=================================================
  .factory('SteamAPI',['$http',function($http){
    return {
      getGames : function(id){
        return $http.get('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=76561198061541150&include_appinfo=1&include_played_free_games=1&format=json');
      },
      getPlayer : function(id){
        return $http.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamids=76561198061541150');
      },
      getGameStats : function(id){
        return $http.get('http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=246420&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=76561198061541150');
      },
      getDynamicStore : function(){
        return $http.get('http://store.steampowered.com/dynamicstore/userdata/');
      }
      //http://steamspy.com/api.php
    };
  }])

//=================================================
// Filtrar
// - Paradas
//=================================================
  .factory('Filtrar', function($rootScope, EMT){

    var self = this;
    var db = false;

    //| paradas: Filtra DB
    //| Funcionamiento principal del buscador
    //+ ------------------------
    //| Comparación de cada elemento {nombre} con la searchString
    //+---------------------------------------
      self.paradas = function(string, backspace){
        
        //if(backspace || !db){ db = EMT.paradas; console.warn("reset"); }
        db = EMT.paradas;
        if(string.length == 0){ return []; }

        searchString = self.normalizar(string);
        result = [];

        console.log("timestamp", db.length, searchString);

        if(isNaN(string)){
          angular.forEach(db, function(item){
            comparador = self.normalizar(item.nombre);

            if(comparador.indexOf(searchString) !== -1){
              //item.nombre = item.nombre + " - " + comparador;
              result.push(item);
            }

          });
        }

        console.log("timestamp", db.length, result.length);
        db = result;
        
        return result;
      };

    //| normalizar: normaliza texto de entrada
    //+---------------------------------------
      self.normalizar = function(string){

        value = string

        .toLowerCase()
        .replace('ctra.', 'carretera')
        .replace('cra.', 'carretera')
        .replace('av.', 'avenida')
        .replace('avinguda', 'avenida')
        .replace('pl.', 'plaza')
        .replace('pol.', 'poligono')

        .replace('de ', '').replace('d\'', '')
        .replace('del ', '')

        .replace(/á/g, 'a').replace(/à/g, 'a')
        .replace(/é/g, 'e').replace(/è/g, 'e')
        .replace(/í/g, 'i').replace(/ì/g, 'i')
        .replace(/ó/g, 'o').replace(/ò/g, 'o')
        .replace(/ú/g, 'u').replace(/ù/g, 'u')
        .replace(/ç/g, 'c').replace(/s/g, 'c')
        .replace(/q/g, 'c').replace(/z/g, 'c')
        .replace(/k/g, 'c')
        .replace(/v/g, 'b')
        .replace(/y/g, 'i')
        .replace(/g/g, 'j')
        .replace(/ny/g, 'ñ').replace(/ñ/g, 'n')
        .replace(/l'/g, 'l')//.replace(/ll/g, 'y')
        .replace(/:/g, '');

        return value;
      };


    return self;
  })

//=================================================
// Games
// - incrementar (idParada)
// - recientes (ultima)
// - checkFavorito (idParada)
// - ToggleFavorito (idParada)
//=================================================
  .factory('Games', function($rootScope){
    return{

      //| Analyze
      //| Updates rootScope and localstorage 
      //+---------------------------------------
        Analyze: function(games){

          console.warn(games);
          //console.warn(games);
          console.warn(games[0]);


          //Check each game for stats
          angular.forEach(games, function(item){
            $rootScope.user.hoursPlayed = $rootScope.user.hoursPlayed + item.playtime_forever;
          });

          console.log($rootScope.user);
          return;

          //Break if corrupt
          if(!ultima.nombre){ return; }
          var recientes = $rootScope.db.recientes;

          //Remove item if already in object
          angular.forEach(recientes, function(item){
            if(item.id === ultima.id){
              recientes.splice(recientes.indexOf(item),1);
            }
          });

          //insert last at the beggining of object
          recientes.splice(0, 0, ultima);

          //elimina la ultima si la cadena es mayor a 10
          if(recientes.length > 10){ recientes.splice(10, 1); }

          $rootScope.db.recientes = recientes;
          localstorage.setObject('recientes', $rootScope.db.recientes);

          return true;
        },

      //| checkFavorito
      //| Returns true or false if stop is fav
      //+---------------------------------------
        checkFavorito: function(idParada){
          var fav = false;

          angular.forEach($rootScope.db.favoritos, function(item){
            if(item.id === idParada){
              fav = true;
            }
          });

          return fav;
        }
    };
  })

//=================================================
// InfoItinerario
// - getInfo (nombreLinea, idLinea, isTib)
// - getLinea (nombreLinea, idLinea, isTib)
// - getParada (idParada, isTIB)
// - getIncidencias (idLinea)
//=================================================
  .factory('InfoItinerario', ['EMT','TIBTREN','$rootScope', function(EMT,TIBTREN,$rootScope){
    return{
      getInfo: function(nombreLinea, idLinea, isTIB){

        if(isTIB){
          var itinerarios = TIBTREN.itinerarios;
        }else{
          var itinerarios = EMT.itinerarios;
        }

        var resultado = [];

        if(nombreLinea){
          nombreLinea.toUpperCase();

          angular.forEach(itinerarios, function(item){
            if(item.nombre.toUpperCase() === nombreLinea){
              resultado = item;
            }
          });
        }else{
          angular.forEach(itinerarios, function(item){
            //console.log(item);
            if(item.id === idLinea){
              resultado = item;
            }
          });
        }

        return resultado;

      },

      getLinea: function(nombreLinea, idLinea, isTIB){

        if(isTIB){
          var lineas = TIBTREN.lineas;
        }else{
          var lineas = EMT.lineas;
        }

        var resultado = [];

        if(nombreLinea){
          nombreLinea.toUpperCase();

          angular.forEach(lineas, function(item){
            if(item.nombre.toUpperCase() === nombreLinea){
              resultado = item;
            }
          });
        }else{
          angular.forEach(lineas, function(item){
            //console.log(item);
            if(item.id === idLinea){
              resultado = item;
            }
          });
        }

        return resultado;

      },
      getParada: function(idParada, isTIB){
        idParada = parseInt(idParada);
        var encontrado = false;

        if(isTIB){
          var paradas = TIBTREN.paradas;
        }else{
          var paradas = EMT.paradas;
        }

        angular.forEach(paradas, function(item){
          if(!encontrado){
            if(item.id === idParada){
              encontrado = item;
            }
          }
        });

        return encontrado;

      },
      getItinerarios: function(idParada){
        idParada = parseInt(idParada);
        var encontrado = false;
        var itinerarios = TIBTREN.itinerarios;
        var lineas = [];

        angular.forEach(itinerarios, function(item){
          encontrado = false;
          angular.forEach(item.paradas, function(parada){
            if(!encontrado){
              if(parada == idParada){
                encontrado = item;
                //console.log(item);
                lineas.push(item);
              }
            }

          });
        });

        return lineas;

      },
      getIncidencias: function(idLinea, full){

        idLinea = parseInt(idLinea);
        var resultado = [];
        var num_avisos = 0;

        //por cada item de incidencia, se extraen las lineas
        angular.forEach($rootScope.server.incidencias, function(item){

          var lineas = ""+item.lineas;
          lineas.toString();
          var obj = lineas.split(",");


          obj.forEach(function(entry) {
            if(idLinea === parseInt(entry)){
              if(full){
                resultado.push(item);
              }else{
                num_avisos++;
              }
              //resultado.push(item);
              //console.log(entry);


            }
          });

        });

        if(full){
          return resultado;
        }else{
          return num_avisos;
        }


      }
    };
  }])


//=================================================
// localstorage
//=================================================
  .factory('localstorage', ['$window', function($window) {
    return {
      set: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function(key, value) {
        angular.forEach(value, function(item){
          delete item.$$hashKey;
        });
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    };
  }])
;