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

          // Attributes filter
          if(filters.singlePlayer && !game.singlePlayer){ continue;}
          if(filters.multiPlayer && !game.multiPlayer){ continue;}
          if(filters.coop && !game.coop){ continue;}
          if(filters.mmo && !game.mmo){ continue;}
          if(filters.controller && !game.controller){ continue;}
          if(filters.achievements && !game.achievements){ continue;}

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

        //console.warn("FILTER RESULT", filters, result);
        return result;
      };

    //| normalize: normalizes searchstring
    //+---------------------------------------
      self.normalize = function(string){

        value = string

        .toLowerCase()
        .replace('pol.', 'poligono')

        .replace(/á/g, 'a').replace(/à/g, 'a')
        .replace(/é/g, 'e').replace(/è/g, 'e')
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
    
    var activeApp = false;
    return{

      //| checkFavorito
      //| Returns true or false if stop is fav
      //+---------------------------------------
        setApp: function(newApp){
          activeApp = newApp;
          return true;
        },

        getDetails: function(){
          return $rootScope.db[activeApp];
        },

      //| getAllTags
      //| Returns an array of all tags in db
      //+---------------------------------------
        getAllTags: function(){
          tags = [];

          for(g in $rootScope.db){
            item = $rootScope.db[g];
            if(item.tags){
              for(i in item.tags.slice(0, 4)){
                if(tags.indexOf(item.tags[i]) == -1){
                  tags.push(item.tags[i]);
                }else{
                  //console.log(tags);
                }
              }
            }
          }

          return tags;
        }

    };
  })
;
