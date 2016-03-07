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
//=================================================
  .factory('Filter', function($rootScope){

    var self   = this;
    //var db     = $rootScope.db;

    //| Filter.games: Filter db
    //+ ------------------------
    //| Using all filters available, returns
    //| match in a single iteration
    //+---------------------------------------
      self.games = function(filters){

        var result       = {games: [], tags: []};
        var searchString = (filters)? filters.string.toLowerCase() : false;

        dance: for(i in $rootScope.db){

          game = $rootScope.db[i];
          game.appid = i;
          gameName = game.name.toLowerCase();

          // Searchstring filter
          if(searchString && gameName.indexOf(searchString) == -1){ continue; }

          // Metascore filter
          if(filters.orderBy == "-metascore"){
            if(!game.metascore){ continue; }
          }

          // steamscore filter
          if(filters.orderBy == "-steamscore"){
            if(!game.steamscore){ continue; }
          }

          //Tag filter
          if(filters.tags.length > 0){
            if(!game.tags){ continue; }

            for(f in filters.tags){
              if(game.tags.indexOf(filters.tags[f]) == -1){ continue dance; } }
          }

          // Add game info to return
          result['games'].push(game);
          for(t in game.tags){
            if(result['tags'].indexOf(game.tags[t]) == -1){
              result['tags'].push(game.tags[t]); } }
        }

        console.warn("FILTER RESULT", filters, result);
        return result;
      };

    //| normalize: normalizes searchstring
    //+---------------------------------------
      self.normalize = function(string){

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
      //| Returns an array of all tags in db
      //+---------------------------------------
        getAllTags: function(){
          tags = [];

          for(g in $rootScope.db){
            item = $rootScope.db[g];
            if(item.tags){
              for(i in item.tags){
                if(tags.indexOf(item.tags[i]) == -1){
                  tags.push(item.tags[i]);
                }else{
                  //console.log(tags);
                }
              }
            }
          }

          return tags;
        },

      //| checkFavorito
      //| Returns true or false if stop is fav
      //+---------------------------------------
        getInfo: function(id){
          return id;
        }
    };
  })

;
