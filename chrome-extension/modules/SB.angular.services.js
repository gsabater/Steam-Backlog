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
// Filter
// - Paradas
//=================================================
  .factory('Filter', function($rootScope){

    var self   = this;
    var db     = $rootScope.db;


    //| Filter.games: Filter db
    //+ ------------------------
    //| uses all filters to get information in
    //| a single iteration
    //+---------------------------------------
      self.games = function(filters){

        var num = 0;
        var result = [];

        searchString = (filters)? filters.string.toLowerCase() : false;
        console.log(searchString);

        for(i in $rootScope.db){

          game = $rootScope.db[i];
          game.appid = i;
          gameName = game.name.toLowerCase();

          if(num >= 20){ break; }
          if(searchString && gameName.indexOf(searchString) == -1){ continue; }

          result.push(game);
          num++;

        }

        result = [{appid:"220",cached:1457000969612,name:"Half-Life 2 rock",playtime_forever:447},{appid:"340",cached:1457000969612,name:"Half-Life 2: Lost Coast",playtime_forever:0},{appid:"380",cached:1457000969612,name:"Half-Life 2: Episode One",playtime_forever:1},{appid:"400",cached:1457000969612,name:"Portal",playtime_forever:5},{appid:"420",cached:1457000969612,name:"Half-Life 2: Episode Two",playtime_forever:1},{"achieved":162,"achievements":518,appid:"440",cached:1457000969612,"controller":true,"metascore":"92","multiPlayer":true,name:"Team Fortress 2",playtime_forever:10828,"released":"10 Oct, 2007","singlePlayer":true,"steamscore":"Overwhelmingly Positive","tags":["Free to Play","Multiplayer","FPS","Action","Shooter","Class-Based","Trading","Funny","Team-Based","Cartoony","First-Person","Competitive","Co-op","Online Co-Op","Comedy","Robots","Tactical","Crafting","Cartoon","Moddable"],"updated":1457000969619},{"achieved":12,"achievements":70,appid:"550",cached:1457000969612,"controller":true,"coop":true,"metascore":"89","multiPlayer":true,name:"Left 4 Dead 2",playtime_forever:1934,"released":"17 Nov, 2009","singlePlayer":true,"steamscore":"Overwhelmingly Positive","tags":["Zombies","Co-op","FPS","Multiplayer","Action","Online Co-Op","Shooter","First-Person","Survival","Team-Based","Horror","Moddable","Gore","Survival Horror","Post-apocalyptic","Singleplayer","Local Co-Op","Tactical","Adventure","Replay Value"],"updated":1457000992650},{appid:"570",cached:1457000969612,name:"Dota 2",playtime_forever:126},{appid:"620",cached:1457000969612,name:"Portal 2",playtime_forever:267},{appid:"730",cached:1457000969612,name:"Counter-Strike: Global Offensive",playtime_forever:856},{appid:"1510",cached:1457000969612,name:"Uplink",playtime_forever:0},{appid:"1930",cached:1457000969612,name:"Two Worlds: Epic Edition",playtime_forever:285},{appid:"2400",cached:1457000969612,name:"The Ship",playtime_forever:146},{appid:"2420",cached:1457000969612,name:"The Ship Single Player",playtime_forever:0},{appid:"2430",cached:1457000969612,name:"The Ship Tutorial",playtime_forever:0},{appid:"3130",cached:1457000969612,name:"Men of War: Red Tide",playtime_forever:0},{appid:"3170",cached:1457000969612,name:"King's Bounty: Armored Princess",playtime_forever:0},{appid:"3270",cached:1457000969612,name:"Painkiller Overdose",playtime_forever:0},{appid:"3483",cached:1457000969612,name:"Peggle Extreme",playtime_forever:0},{"achieved":21,"achievements":21,appid:"3590",cached:1457000969612,"metascore":"87",name:"Plants vs. Zombies: Game of the Year",playtime_forever:2649,"released":"5 May, 2009","singlePlayer":true,"steamscore":"Overwhelmingly Positive","tags":["Tower Defense","Zombies","Strategy","Casual","Singleplayer","Comedy","Family Friendly","2D","Puzzle","Indie","Cute","Funny","Great Soundtrack","Touch-Friendly","Survival","Tactical","Classic","Action","Adventure","Post-apocalyptic"],"updated":1457000983986}];
        console.warn("FILTER RESULT",filters, result);
        return result;

      };
/*

      self.games = function(string, backspace){

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
*/
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

      //| getAllTags
      //| Returns an array of all tags found in
      //| the games
      //+---------------------------------------
        getAllTags: function(){
          tags = [];

          angular.forEach($rootScope.db, function(item){
            if(item.tags){
              for(i in item.tags){
                if(tags.indexOf(item.tags[i]) == -1){
                  tags.push(item.tags[i]);
                }else{
                  //console.log(tags);
                }
              }
            }
          });

          console.log(tags);
          return tags;
        },

      //| checkFavorito
      //| Returns true or false if stop is fav
      //+---------------------------------------
        getInfo: function(id){
          return id;
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
