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
        return $http.get('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=76561198061541150&format=json');
      }
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
// FavTop
// - incrementar (idParada)
// - recientes (ultima)
// - checkFavorito (idParada)
// - ToggleFavorito (idParada)
//=================================================
  .factory('FavTop', function($rootScope, localstorage){
    return{

      //| updateRecientes
      //| Updates rootscope and localstorage 
      //| recent stops object.
      //+---------------------------------------
        updateRecientes: function(ultima){

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
        },

      //| toggleFavorito
      //| Adds or inserts a stop in fav
      //+---------------------------------------
        toggleFavorito: function(parada){

          var favoritos = $rootScope.db.favoritos;
          var found = false;

          angular.forEach(favoritos, function(item){
            if(item.id === parada.id){ found = item; }
          });

          if(!found){
            favoritos.push(parada);
          }else{
            favoritos.splice(favoritos.indexOf(found), 1);
          }

          $rootScope.db.favoritos = favoritos;
          localstorage.setObject('favoritos', $rootScope.db.favoritos);

          return true;
        }

      /*
      incrementar: function(idParada, object, nombreParada){

        var clean = true;
        var resultado = object;
        //console.log("-----------------------------");
        //console.log(object);
        angular.forEach(resultado, function(item){
          if(item.id === idParada){
            //console.log("si: "+item.parada);
            item.clicks++;
            //console.log(item.clicks);
            clean = false;
          }else{
            //console.log("no"+item.parada);
          }
        });

        if(clean === true){
          //console.log("Añadido: "+idParada);
          resultado.push({id: idParada, clicks: 1, nombre: nombreParada});
        }
        //console.log("-----------------------------");
        return resultado;
      },
      */
      
      

      /*

      */
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
// El Tiempo
// $http call
//=================================================
  .factory('elTiempo',['$http', '$rootScope', 'localstorage', function($http, $rootScope, localstorage){
    return {
      getTiempo : function(){

        var elTiempo = localstorage.getObject('elTiempo');

        function getApiWeather(pos){
          if(pos === false){
            console.log("Llamando api con coordenadas de Palma");
            var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=39.573793&lon=2.6406497&cnt=4&mode=json&units=metric';
          }else{
            console.log("Llamando api con coordenadas "+pos.coords.latitude+", "+pos.coords.longitude);
            var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&cnt=4&mode=json&units=metric';
          }

          $http({method: 'GET', url: url}).
          success(function(data) {

            var elTiempo = {
              date_download: Date.now(),
              data: data
            };

            localstorage.setObject('elTiempo', elTiempo);
            $rootScope.tiempo = elTiempo;

          }).error(function(data, status, headers, config) {

            //console.log("error con api tiempo");

          });

        }

        function getOpenweather(){
          //console.log("get Weather");
          navigator.geolocation.getCurrentPosition(function(pos) {
            getApiWeather(pos);
          }, function(error) {
            getApiWeather(false);
          },{maximumAge: 30000, timeout:7000});
        }


        if(elTiempo.date_download){
          //console.log("localstorage");
          if((Date.now() - elTiempo.date_download) > (3 * 60 * 60 * 1000)){
            //console.log("localstorage pero old");
            getOpenweather();
          }else{
            //console.log("localstorage menos de 3h");
            $rootScope.tiempo = elTiempo;
          }
        }else{
          //console.log("sin localstorage");
          getOpenweather();
        }

        return false;
      }
    };
  }])


//=================================================
// Google Maps
// - getLocation
//=================================================
  .factory('gMaps', function($rootScope, $q){
    return{
      getLocation: function(){
        var pos = false;
        var deferred = $q.defer();

        navigator.geolocation.getCurrentPosition(function(pos) {
          deferred.resolve(pos);
        }, function(error) {
          deferred.reject(error);
        },{maximumAge: 900000, timeout:5000, enableHighAccuracy: true}); //age, milisenconds

        return deferred.promise;
      }
    };
  })

//=================================================
// Publicidad
// - getTipo (tipoPublicidad)
//=================================================
  .factory('Publicidad', function($rootScope){
    return{
      getTipo: function(tipoPublicidad){

        var resultado = [];
        var encontrado = false;

        angular.forEach($rootScope.server.promocion, function(item){

          if(!encontrado){
            if(item.tipo == tipoPublicidad){
              if(tipoPublicidad === "home"){
                resultado = item;
                encontrado = true;
              }
            }
          }

        });

        if(!encontrado){
          return false;
        }else{
          return resultado;
        }

      },
      getParada: function(idParada){

        var resultado = [];
        var encontrado = false;

        angular.forEach($rootScope.server.promocion, function(item){

          var lineas = ""+item.idParada;
          lineas.toString();
          var obj = lineas.split(",");

          obj.forEach(function(entry) {

            if(entry == idParada){
              resultado.push(item);
              console.log("publicidad encontrada para parada: ",entry);
            }

          });

        });

        return resultado;
      },
      getId: function(idPublicidad){

        var resultado = [];
        var encontrado = false;

        angular.forEach($rootScope.server.promocion, function(item){


          if(!encontrado){
            if(item.id == idPublicidad){
              resultado = item;
              encontrado = true;
            }
          }

        });

        return resultado;
      }
    };
  })

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


//=================================================
// DB
// + init     -- gets firebase and starts sqlite
// + start    -- start sqlite tables and service
// + query    -- run query
// + fetchAll -- get all table
// + fetch    -- get single row
//=================================================
  .factory('DB', function($rootScope, $interval, $q, $firebaseObject, DB_CONFIG, localstorage){

    var self = this;
    self.db = null;


    //| Init: gets firebase and starts sqlite
    //+---------------------------------------
      self.init = function(){
        var fbase = new Firebase("https://horabaixa.firebaseio.com");
        $rootScope.app.firebase = $firebaseObject(fbase);
        fbase.on("value", function(data){
          self.Firebase();
        });

        //SQLite init
        self.start();
      };


    //| Start: Runs SQLite tables & buffer
    //+---------------------------------------
      self.start = function(){

        if(!self.db){
          self.db = (window.sqlitePlugin)? window.sqlitePlugin.openDatabase({name: DB_CONFIG.name+".db", location: 1}) : window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1) ;
          
          if(window.sqlitePlugin){  console.warn("+ App: SQLite app"); }
          else{                     console.warn("+ App: SQLite PC");  }

          self.db.transaction(function(tx){

            angular.forEach(DB_CONFIG.tables, function(table){
              var columns = [];

              angular.forEach(table.columns, function(column){
                columns.push(column.name + ' ' + column.type);
              });

              //tx.executeSql('DROP TABLE IF EXISTS ' + table.name);
              tx.executeSql('CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')');
              tx.executeSql('DROP TABLE IF EXISTS emt_' + table.name);

              console.log('+ App SQL: Table ' + table.name + ' initialized');
            });
            
            $rootScope.buffer();

          }, function(e) {
            console.log("ERROR: " + e.message);
          });
        }

      };


    //| Update: Updates Database with firebase
    //+---------------------------------------
      self.Firebase = function(){
        window.setTimeout(function(){

          //console.log($rootScope.app.firebase.paradas);
          self.update();
          
        }, 1000);
      };


    //| Update: Updates Database with firebase
    //+---------------------------------------
    self.update = function(){
      console.log("+ App: Background updater");
      
      if( ((Date.now()/1000) - $rootScope.user.update ) > 86400 ){
        $rootScope.buffer();

        updateProgress = $rootScope.app.firebase.paradas.length; // + lineas + itinerarios
        console.log("+ App: updating ", updateProgress);

        angular.forEach($rootScope.app.firebase.paradas, function(item){

          if(item.id < 600){ //cambiar por fecha de update en firebase xd
            self.query('INSERT OR REPLACE INTO paradas (id, nombre, lat, lng, otras, clicks) VALUES (?,?,?,?,?,COALESCE((SELECT clicks FROM paradas WHERE id = '+item.id+'), 0))',[item.id, item.nombre, item.lat, item.lng, item.otras])
            .then(function(result){
              
              updateProgress--;
              $rootScope.updateProgress = updateProgress;
              //$rootScope.updateMatrix.unshift(item.nombre);
              //console.log("Insert ok", result, updateProgress);
              
              if(updateProgress == 0){
                $rootScope.buffer();
              }
            }, function(err){ console.log(err); });
          }else{
            updateProgress--;
            $rootScope.updateProgress = updateProgress;
            if(updateProgress == 0){
              $rootScope.buffer();
            }
          }

        });


        $rootScope.user.update = (Date.now()/1000);
        localstorage.setObject('user', $rootScope.user);

      }else{
        console.log("no toca update");
      }
  /*
      EMTdb.prepareParadas();
      updateProgress = respuesta.paradas.length + respuesta.lineas.length + respuesta.itinerarios.length;

      if(respuesta.updated !== true){
        angular.forEach(respuesta.lineas, function(item){

          //| Update emt_lineas
          //+--------------------------------
          DB.query('INSERT OR REPLACE INTO emt_lineas (id, nombre, color, itinerarios) VALUES (?,?,?,?)',[item.id, item.nombre, item.color, item.itinerarios])
          .then(function(result){
            //console.log("Insert ok", result);
            updateProgress--;
            $rootScope.updateProgress = updateProgress;
            $rootScope.updateMatrix.unshift(item.nombre);
            //return DB.fetchAll(result);
          }, function(err){ console.log(err); });

        });

        angular.forEach(respuesta.itinerarios, function(item) {

          //| Update emt_lineas
          //+--------------------------------
          DB.query('INSERT OR REPLACE INTO emt_itinerarios (id, nombre, destino, indeterminado, primero, ultimo, frecuencia, primeroSab, ultimoSab, frecuenciaSab, primeroFest, ultimoFest, frecuenciaFest, paradas) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [item.id, item.nombre, item.destino, item.indeterminado, item.primero, item.ultimo, item.frecuencia, item.primeroSab, item.ultimoSab, item.frecuenciaSab, item.primeroFest, item.ultimoFest, item.frecuenciaFest, item.paradas])
          .then(function(result){
            console.log("Insert ok", result);
            updateProgress--;
            $rootScope.updateProgress = updateProgress;
            $rootScope.updateMatrix.unshift(item.nombre);
            //return DB.fetchAll(result);
          }, function(err){ console.log(err); });

        });

        angular.forEach(respuesta.paradas, function(item) {

          //| Update emt_paradas
          //+--------------------------------
          DB.query('INSERT OR REPLACE INTO emt_paradas (id, nombre, lat, lng, otras, clicks) VALUES (?,?,?,?,?,COALESCE((SELECT clicks FROM emt_paradas WHERE id = '+item.id+'), 0))',[item.id, item.nombre, item.lat, item.lng, item.otras])
          .then(function(result){
            console.log("Insert ok", result);
            updateProgress--;
            $rootScope.updateProgress = updateProgress;
            $rootScope.updateMatrix.unshift(item.nombre);
            //return DB.fetchAll(result);
            if(updateProgress == 0){
              //console.log("SYNC FINALIZADO");
              $rootScope.updateExists = false;
              EMTdb.prepareParadas();
            }
          }, function(err){ console.log(err); });


        });

        $rootScope.user.EMTv = respuesta.version;
        localstorage.setObject('user', $rootScope.user);

      }else{
        console.log("+ App: db-EMT updated");
      }
  */
    };


    //| Query: Executes a query
    //+---------------------------------------
      self.query = function(query, bindings){
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function(transaction) {
          transaction.executeSql(query, bindings, function(transaction, result) {
            deferred.resolve(result);
          }, function(transaction, error) {
            deferred.reject(error);
          });
        });

        return deferred.promise;
      };


    //| Query: Executes a query
    //+---------------------------------------
      self.fetchAll = function(result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
          output.push(result.rows.item(i));
        }

        return output;
      };

      self.fetch = function(result) {
        return result.rows.item(0);
      };    

    return self;
  })


//=================================================
// EMTdb
// - updateAPI -> Inserts all data to SQL
// http://stackoverflow.com/questions/418898/sqlite-upsert-not-insert-or-replace/4330694#4330694
//=================================================
  .factory('EMTdb', function($rootScope, DB){

    var paradas = false, top = false, searchTop = false, wrap = false;
    var self = this;

      //| Buffer: 
      //| + Stores SQLite stops in a var so we 
      //| + can access them later.
      //| + Its done from various sources.
      //+---------------------------------------
        self.buffer = function(){
          console.log("+ App: Buffer paradas");

          if(DB.db && ($rootScope.user.update > 0)){
            console.log("buffer sqlite");
            DB.query('SELECT * FROM paradas order by clicks').then(function(result){ paradas = DB.fetchAll(result);console.log("paradas",paradas); });
            $rootScope.app.ready = true;
          }else{
            console.log("buffer firebase");
            if($rootScope.app.firebase.paradas){
              paradas = $rootScope.app.firebase.paradas;
              console.log("firebase here", paradas);
              $rootScope.app.ready = true;
            }else{
              console.log("no ha llegado firebase");
            }
          }

        };


      //| getParada: 
      //| + Gets SQLite information about that 
      //| + bus stop.
      //+---------------------------------------
        self.getParada = function(id){
          return DB.query('SELECT * FROM paradas WHERE id = ?', [id])
          .then(function(result){
            return DB.fetch(result);
          });
        };

        self.getParadas = function() { return paradas; };
        self.getTop = function() { return top; };
        self.searchTop = function() { return searchTop; };


      //| Clicks:
      //| + Updates click number in SQLite so
      //| + We can order later
      //+---------------------------------------
        self.clicks = function(id) {
          return DB.query('UPDATE paradas SET clicks=clicks+1 WHERE id = ?', [id])
          .then(function(result){
            self.buffer();
          });
        };

      //| Clicks:
      //| + Updates click number in SQLite so
      //| + We can order later
      //+---------------------------------------
        self.resetClicks = function(id) {
          return DB.query('UPDATE paradas SET clicks=0 WHERE id = ?', [id])
          .then(function(result){
            self.prepareParadas();
          });
        };

      //| Init: gets firebase and starts sqlite
      //+---------------------------------------
        self.getItinerarioByNombre = function(nombre){
          return DB.query('SELECT * from itinerarios where destino = ?', [nombre])
          .then(function(result){
            return DB.fetch(result);
          });
        };

      //| Init: gets firebase and starts sqlite
      //+---------------------------------------
        self.getNearest = function(lat,lng,rad){
          var latPlus = lat + 0.0025,latMinus = lat - 0.0025;
          var lngPlus = lng + 0.0025,lngMinus = lng - 0.0025;

          return DB.query('SELECT * from paradas where (lat BETWEEN '+latMinus+' AND '+latPlus+') AND (lng BETWEEN '+lngMinus+' AND '+lngPlus+')', [])
          .then(function(result){
            return DB.fetchAll(result);
          });
        };

    return self;
  })
;