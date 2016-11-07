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

//+-------------------------------------------------------
//| updateDB()
//| + updates database for each game for an interval
//+-------------------------------------------------------
  function updateDB(){

    var d = new Date();
    var n = d.getTime();

    // 1. stop execution if we don't have any games
    if(!db || Object.keys(db).length === 0){
      console.warn("Steam Backlog: db is empty. Stopping updateDB()");
      return; }

    //1.5 if the queue to update games has been already processed
    if(isQueue){ console.warn("Steam Backlog: db queue is completed. Stopping updateDB()"); return; }

    // 2. Order all db games by playtime
    // if the game is updated recently, remove from list
    if(queue.length === 0){

      for(var i in db){
        g = db[i];
        if(!g.updated || (n - g.updated) > 2592000000 ){ // 30 dias
          queue.push([g.appid, g.playtime_forever]);
        }
      }

      queue.sort(function(a, b){ return b[1] - a[1]; });
    }

    if(queue.length > 0){
      console.log("hay queue", queue.length);
      getGameInfo();

    }else{
      isQueue = true;
      //clearTimeout(timeout);
      //if(isAngular){ $("div[ng-view]").scope().jQueryCallback(); }
      console.log("everything ok");
    }

  }


//+-------------------------------------------------------
//| getGameInfo()
//| + Using queue var containing game IDs
//| + scrapes information from the steam public page
//| + and saves into game db
//+-------------------------------------------------------
  function getGameInfo(injectID){ //console.warn(injectID, queue);

    var gameID = queue[0];
    gameID = (Array.isArray(gameID))? gameID[0] : gameID;

  //| 1. Add games to queue if injectID is set
  //+-------------------------------------------------------
    if(injectID){

      if(typeof injectID == "string"){ queue.unshift(injectID); }
      if(Array.isArray(injectID)){ queue.unshift(injectID[0]); }

      getGameInfo();
      return;
    }

    //| 3. scrap that game
    //+-------------------------------------------------------
    scrapGame(gameID);
  }

//+-------------------------------------------------------
//| getGameInfo()
//| + Using queue var containing game IDs
//| + scrapes information from the steam public page
//| + and saves into game db
//+-------------------------------------------------------
  function scrapGame(gameID){

    var d = new Date();
    var n = d.getTime();

    console.log("%c Steam Backlog: Scrap Game -> " + gameID + " ( " + db[gameID].name + " ) ", 'background: #222; color: #bada55');

  //| 1. Get JSON details for app gameID
  //| --
  //+-------------------------------------------------------
    $.getJSON("http://store.steampowered.com/api/appdetails?appids=" + gameID,
    function(data){

      var jsonData = data[gameID].data;
      console.log(jsonData);

      // Dates
      db[gameID].updated  = n;
      db[gameID].released = jsonData.release_date.date;

      // metascore
      if(jsonData.hasOwnProperty("metacritic")){ db[gameID].metascore = jsonData.metacritic.score; }

      // Features
      db[gameID].achievements = false;

      for(var i in jsonData.categories){
        var feature = jsonData.categories[i];

        if(feature.id == 22){ db[gameID].achievements = true; }
        if(feature.id == 29){ db[gameID].cards = true; }
        if(feature.id == 28){ db[gameID].controller = true; }
        if(feature.id == 18){ db[gameID].controller = true; }

        if(feature.id == 2){ db[gameID].singlePlayer = true; }
        if(feature.id == 1){ db[gameID].multiPlayer = true; }
        if(feature.id == 27){ db[gameID].multiPlayer = true; }
        if(feature.id == 20){ db[gameID].mmo = true; }

        if(feature.id == 9){ db[gameID].coop = true; }
        if(feature.id == 24){ db[gameID].coop = true; }
        if(feature.id == 24){ db[gameID].localCoop = true; }
      }

    //| 2. Scrap html page
    //| Get tags, user reviews, ...
    //+-------------------------------------------------------
      $.get( "http://store.steampowered.com/app/" + gameID )
      .done(function(xhr){

        // Clean data to avoid loading extra images via xhr
        xhr = xhr.replace(/<img[^>]*>/g,"");

        // Stop if age barrier
        if(!$(".apphub_AppName", xhr).length){
          console.warn("Game not available");
          saveGameInfo(gameID);
          return;
        }

        // Steam Score
        if($(".game_review_summary", xhr).length){
          steamscore = $(".glance_ctn_responsive_left div[data-store-tooltip]", xhr).attr("data-store-tooltip");
          steamscore = steamscore.split("%")[0];

          db[gameID].steamscore    = steamscore.replace(/\D/g,'');
          db[gameID].steamscoreAlt = $(".game_review_summary", xhr).text();
        }else{
          db[gameID].steamscore    = 0;
          db[gameID].steamscoreAlt = "No score yet";
        }

        // Game tags
        var tags = [];
        $(".popular_tags a", xhr).each(function(){ tags.push($(this).text().trim()); });
        db[gameID].tags = tags.slice(0, 20);


      //| 3. Get achievements stats
      //+-------------------------------------------------------
        $.getJSON("http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=" + gameID + "&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=" + user.steamid,
        function(data){
          // execute always to avoid errors 400 given by steam
        })
        .always(function(data){

          // if error code 503 || > 500

          // Achievements info if it has
          if(data.hasOwnProperty("playerstats")){
            if(data.playerstats.hasOwnProperty("achievements")){
              var achieved = 0; for(i in data.playerstats.achievements){
                if(data.playerstats.achievements[i].achieved == 1){ achieved++; } }

              db[gameID].achievements = data.playerstats.achievements.length;
              db[gameID].achieved     = achieved;

            }
          }

          //howLongToBeatSteam(gameID);
          saveGameInfo(gameID);

        });
      });

    });

  }

//+-------------------------------------------------------
//| howLongToBeatSteam()
//| + Loads user information from howlongtobeatsteam
//| + Fills information for a certain or all games
//+-------------------------------------------------------
  function howLongToBeatSteam(gameID){

  //| Get howlongtobeatsteam info
  //| And call function again
  //+-------------------------------------------------------
    if(hltbs == false){
      $.getJSON("http://www.howlongtobeatsteam.com/api/games/library/" + user.steamid + "?callback=jsonp", function(hltbs){
      }).always(function(xhr){
        hltbs = xhr;
        howLongToBeatSteam(gameID);
      });

      return;
    }

  //| For every game into howlongtobeatsteam
  //| insert data on db
  //+-------------------------------------------------------
    for(i in hltbs.Games){
      game = hltbs.Games[i].SteamAppData;
      //console.log(game.SteamAppId, game);

      //if((gameID !== "all") && (game.SteamAppId !== gameID)){ continue; }
      if(db[game.SteamAppId]){ db[game.SteamAppId].hltb = game.HltbInfo; }
      //if((gameID !== "all") && (game.SteamAppId == gameID)){ break; }
    }

  //| Mark missing games from HLTBS in db to avoid calling again
  //+-------------------------------------------------------
    //if(gameID == "all"){
      for(i in db){
        game = db[i];
        if(!game.hasOwnProperty("hltb")){ db[i].hltb = "unavailable"; } }
    //}

  //| Save totals and db objects in chrome.local
  //+-------------------------------------------------------
    user.hltbs = hltbs.Totals;
    chrome.storage.local.set({'user': user}, function(){ /* console.warn("user saved", user); */ });
    chrome.storage.local.set({'db': db}, function(){ /* console.warn("db saved", db); */ });
    if(isAngular){ $("div[ng-view]").scope().jQueryCallback(); }

  }

//+-------------------------------------------------------
//| removeFromQueue()
//| + Removes one game id from the queue
//| + helps removing duplicates and also is much better
//| + than splice(0,1);
//+-------------------------------------------------------
  function removeFromQueue(gameID){
    for(var i in queue){

      _queueID = queue[i];
      _queueID = (Array.isArray(_queueID))? _queueID[0] : _queueID;

      if(_queueID === gameID){
        queue.splice(i, 1);
        console.log("Removing " + gameID + " (" + db[gameID].name + ") from queue.");
      }
    }
  }


//+-------------------------------------------------------
//| removeFromQueue()
//| + Removes one game id from the queue
//| + helps removing duplicates and also is much better
//| + than splice(0,1);
//+-------------------------------------------------------
  function saveGameInfo(gameID){

    removeFromQueue(gameID);
    chrome.storage.local.set({'db': db}, function(){ console.log("db saved"); });

    // Callback
    if(isAngular){ $("div[ng-view]").scope().jQueryCallback();
      var $card = document.getElementById('SB-game-card');
      if($card){ $($card).scope().updateGameDetails(); }
    }

    // 3. Create a stopwatch to process the queue in background
    var time = (isAngular)? 5000 : 15000;
    window.setTimeout(function(){ updateDB(); }, time);

  }
