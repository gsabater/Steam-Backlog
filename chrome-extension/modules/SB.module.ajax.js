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
    var n = d.getTime() / 1000;

    // 1. stop execution if we don't have any games
    if(!db || Object.keys(db).length === 0){
      console.warn("Steam Backlog -> updateDB: db is empty. Stopping updateDB()");
      return; }

    //1.5 if the queue to update games has been already processed
    if(isQueue){ console.warn("Steam Backlog -> updateDB: db queue is completed. Stopping updateDB()"); return; }

    // 2. If there is no queue, build one with
    // db games and wishlist games
    if(queue.length === 0){

      // Iterate over all db games
      // Add new games, refresh games after 30 days and deleted games after a week
      for(var i in db){
        g = db[i];

        //if(g.wishlist && (settings.library.wishlist === false)){
        //  continue; }

        if(!g.updated || (n - g.updated) > 2592000 ){ // 30 dias 2592000000
          queue.push([g.appid, g.playtime_forever]);
        }

        if((g.deleted === true) && (!g.updated || ((n - g.updated) > 648000))){ // 7 dias
          queue.push([g.appid, -100]);
        }

      }

      queue.sort(function(a, b){ return b[1] - a[1]; });

    }

    // 4. If there is still queue remaining
    // call for getGameInfo()
    if(queue.length > 0){
      console.log("hay queue", queue.length);
      timeout = false;
      getGameInfo();

    }else{
      isQueue = true;
      console.log("Steam Backlog -> updateDB: everything ok");
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

    console.log("%c Steam Backlog: Scrap Game -> " + gameID + " ( " + db[gameID].name + " ) ", 'background: #222; color: #bada55');

  //| 1. Get JSON details for app gameID
  //| Data taken from Steam Backlog server API
  //+-------------------------------------------------------
    $.getJSON("http://backlog.bonda.es/api/get/" + gameID,
    function(data){

      // Merge received data into existing db object
      $.extend(db[gameID], data);

    //| 2. Get achievements stats
    //| every user must do it on it's own
    //+-------------------------------------------------------
      $.getJSON("http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=" + gameID + "&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=" + user.steamid,
      function(data){
        // execute always because sometimes the app has no achievements.
      })
      .always(function(data){

        // Achievements info if it has
        if(data.hasOwnProperty("playerstats")){
          if(data.playerstats.hasOwnProperty("achievements")){
            var achieved = 0; for(i in data.playerstats.achievements){
              if(data.playerstats.achievements[i].achieved == 1){ achieved++; } }

            db[gameID].achievements = data.playerstats.achievements.length;
            db[gameID].achieved     = achieved;

          }
        }

        howLongToBeatSteam(gameID);
        saveGameInfo(gameID);

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
    if(hltbs === false){
      $.getJSON("https://www.howlongtobeatsteam.com/api/games/library/" + user.steamid + "?callback=jsonp", function(hltbs){
      }).always(function(xhr){
        hltbs = xhr;
        howLongToBeatSteam(gameID);
      });

      return;
    }

  //| For every game into howlongtobeatsteam
  //| insert data on db
  //+-------------------------------------------------------
    for(var i in hltbs.Games){
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
    if(isAngular){ if($("div[ng-view]").scope().hasOwnProperty("jQueryCallback")){ $("div[ng-view]").scope().jQueryCallback(); } }

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
        console.log("Removing " + gameID + " (" + db[gameID].name + ") from queue ("+ i +")");
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

    // 1. Remove the game from the queue
    // and save the new db
    removeFromQueue(gameID);
    chrome.storage.local.set({'db': db}, function(){ console.log("db saved"); });

    // 2. Inform angular about the update
    // and refresh scope
    if(isAngular){
      if($("div[ng-view]").scope().hasOwnProperty("jQueryCallback")){
        $("div[ng-view]").scope().jQueryCallback();
        var $card = document.getElementById('SB-game-card');
        if($card){ $($card).scope().updateGameDetails(); }
      }
    }

    // 3. Create a stopwatch to star again with settings interval
    var time = settings.scan.interval; //console.log(time,"s");
    if(!timeout){ timeout = window.setTimeout(function(){ updateDB(); }, time * 1000); }

  }
