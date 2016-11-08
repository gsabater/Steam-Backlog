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
    //+ ------------------------
    //| Using all filters available, returns
    //| match in a single iteration
    //+---------------------------------------
      self.games = function(filters){

        var result       = {games: [], tags: []};
        var searchString = (filters)? filters.string.toLowerCase() : false;

        dance: for(var i in $rootScope.db){

          game = $rootScope.db[i];
          game.appid = i;
          gameName = game.name.toLowerCase();

          // Searchstring filter
          if(searchString && gameName.indexOf(searchString) == -1){ continue; }

          // Attributes filter
          if(filters.singlePlayer && !game.singlePlayer){ continue;}
          if(filters.multiPlayer && !game.multiPlayer){ continue;}
          if(filters.coop && !game.coop){ continue;}
          if(filters.localCoop && !game.localCoop){ continue;}
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

          // Achievements filter
          if(filters.orderBy == "-achievementProgress"){
            if(!game.achievements){ continue; }
            game.achievementProgress = game.achieved - game.achievements;
          }

          //HLTB filter
          if(filters.orderBy == "timeToBeat"){
            if(!game.hltb == "unavailable"){ continue; }
            game.timeToBeat = game.hltb.MainTtb; // - game.playtime_forever;
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
