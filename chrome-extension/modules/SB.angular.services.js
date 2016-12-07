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
// Filter
//=================================================
  .factory('Filter', function($rootScope){

    var self   = this;

    //| Filter.games: Filter db
    //+ --------------------------
    //| Using given filters param
    //| returns an object of matching items
    //+---------------------------------------
      self.games = function(filters){

        var result       = {games: [], tags: [], hidden: []};
        var searchString = (filters)? filters.string.toLowerCase() : false;
        var skipped      = 0;

        //| Collections
        //+ --------------------------
        //| new hiddenApps object with appids of hidden apps
        //| new collected obects with appids of selected collection
        //+---------------------------------------
          var hiddenApps = [];
          var collected = false;

          if(filters.collection !== false){
            var collected = $rootScope.collections[filters.collection].apps; }

          for(var c in $rootScope.collections){
            var collection = $rootScope.collections[c];
            if(collection.hide === true){ hiddenApps = hiddenApps.concat(collection.apps); }
          }

        // Do a dance in DB
        // filter out items from filters
        dance: for(var i in $rootScope.db){

          game = $rootScope.db[i];

          // When looking a collection, filter everything else
          if(filters.collection !== false){
            if(collected.indexOf(game.appid) == -1){ continue; } }

          // Filter only wishlist games
          // when specialfilter is set to wishlist
          if((filters.specialFilter == "wishlist") && (game.wishlist !== true)){ continue; }

          // Apply game.name normalization
          gameName = (game.name)? game.name : "";
          gameName = gameName.toString();
          gameName = gameName.toLowerCase();

          // Searchstring filter
          if(searchString && gameName.indexOf(searchString) == -1){ skipped++; continue; }

          // No wishlist
          if($rootScope.settings.library.wishlist === false){
            if(game.wishlist === true){ skipped++; continue; } }

          // Attributes filter
          if(filters.singlePlayer && !game.singlePlayer){ skipped++; continue;}
          if(filters.multiPlayer && !game.multiPlayer){ skipped++; continue;}
          if(filters.coop && !game.coop){ skipped++; continue;}
          if(filters.localCoop && !game.localCoop){ skipped++; continue;}
          if(filters.mmo && !game.mmo){ skipped++; continue;}
          if(filters.controller && !game.controller){ skipped++; continue;}
          if(filters.achievements && !game.achievements){ skipped++; continue;}

          // Score filters
          if(filters.orderBy == "-metascore"){
            if(!game.metascore){ skipped++; continue; } }

          if(filters.orderBy == "-steamscore"){
            if(!game.steamscore){ skipped++; continue; } }

          // Achievements filter
          if(filters.orderBy == "-achievementProgress"){
            if(!game.achievements){ skipped++; continue; }
            game.achievementProgress = game.achieved - game.achievements;
          }

          //HLTB filter
          if(filters.orderBy == "timeToBeat"){
            if(!game.hltb == "unavailable"){ skipped++; continue; }
            game.timeToBeat = game.hltb.MainTtb; // - game.playtime_forever;
          }

          //Tag filter
          if(filters.tags.length > 0){
            if(!game.tags){ skipped++; continue; }

            for(var f in filters.tags){
              if(game.tags.indexOf(filters.tags[f]) == -1){ continue dance; } }
          }

          // When there is a filter search active, but hidden games should be added to the list
          // push them also into hidden object
          if(skipped > 0){
            if(hiddenApps.indexOf(game.appid) > -1){
              result.hidden.push(game); continue; }
          }

          // Add resulting games and tags to result object
          result.games.push(game);
          for(var t in game.tags){
            if(result['tags'].indexOf(game.tags[t]) == -1){
              result['tags'].push(game.tags[t]);
            }
          }

        }

      //| Secondary search
      //| Add possible missing games to return
      //+--------------------------
      //| Search by appid
      //+---------------------------------------
        if(searchString !== "" && !isNaN(searchString)){
          if(db[searchString]){

            var foundByAppid = false;
            for(var g in result.games){
              if(result.games[g].appid == searchString){
                foundByAppid = true;
                break;
              }
            }

            if(!foundByAppid){ result.games.push(db[searchString]); }
          }
        }

        //console.warn("FILTER RESULT", filters, result);
        return result;
      };

    return self;
  })


//=================================================
// Games
// - xxx
//=================================================
  .factory('Games', function($rootScope){

    var activeApp = false;
    return{

      //| setApp
      //| Sets the app requested to other controller
      //+---------------------------------------
        setApp: function(newApp){
          activeApp = newApp;
          return true;
        },

      //| getDetails
      //| Returns the details of the active app
      //+---------------------------------------
        getDetails: function(){
          return $rootScope.db[activeApp];
        },

      //| getRandomGame
      //| Returns a random game.
      //+---------------------------------------
        getRandomGame: function(){
          num = Math.floor((Math.random() * Object.keys(db).length));
          console.log(num);
          return $rootScope.db[num];
        },


      //| overview
      //| Returns an array of all tags in db
      //+---------------------------------------
        overview: function(){
          tags  = [];
          games = [];

          for(var i in $rootScope.db){
            game = $rootScope.db[i];

            // Game tags
            if(game.tags){
              for(var t in game.tags.slice(0, 4)){
                if(tags.indexOf(game.tags[t]) == -1){
                  tags.push(game.tags[t]);
                }
              }
            }
          }

          return {games: games, tags: tags};
        },

    };
  })
;
