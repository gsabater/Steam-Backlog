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

    // 3. Create a stopwatch to process the queue in background
    var time    = (isAngular)? 5000 : 15000;
    var timeout = window.setTimeout(function(){ /* updateDB();*/ }, time);

    if(queue.length > 0){
      console.log("hay queue", queue.length);
      getGameInfo();

    }else{
      isQueue = true;
      clearTimeout(timeout);
      //if(isAngular){ $("div[ng-view]").scope().jQueryCallback(); }
      console.log("everything ok");
    }
    /*
    if(gameID){ getGameInfo(gameID); }else{
      dbScan = false;

    }
    */
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

    var d = new Date();
    var n = d.getTime();

  //| 1. Add games to queue if injectID is set
  //+-------------------------------------------------------
    if(injectID){

      if(typeof injectID == "string"){ queue.unshift(injectID); }
      if(Array.isArray(injectID)){ queue.unshift(injectID[0]); }

      getGameInfo();
      return;
    }

    //| 2. stop execution if the game have been recently updated
    //+-------------------------------------------------------
    if( db[gameID].hasOwnProperty("updated")){
      if( (n - db[gameID].updated) < 2592000000 ){

      removeFromQueue(gameID);
      getGameInfo();
      return; } }

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
  function scrapGame(gameID, extra){

    var d = new Date();
    var n = d.getTime();

    console.log("%c Steam Backlog: Scrap Game -> " + gameID + " ( " + db[gameID].name + " ) ", 'background: #222; color: #bada55');
    return;

  //| Initialize scanning process
  //| Sets flag and initial time vars
  //+-------------------------------------------------------
    $.get( "http://store.steampowered.com/app/" + gameID )
    .done(function(xhr){

      // Clean data to avoid loading extra images via xhr
      xhr = xhr.replace(/<img[^>]*>/g,"");

      // Stop if age barrier
      if(!$(".apphub_AppName", xhr).length){
        console.warn("Game not available");
        db[gameID].updated = n;
        saveGameInfo(gameID);
        return;
      }

      db[gameID].updated    = n;
      db[gameID].released   = $('.release_date .date', xhr).text();

      if($(".game_review_summary", xhr).length){
        steamscore = $(".glance_ctn_responsive_left div[data-store-tooltip]", xhr).attr("data-store-tooltip");
        steamscore = steamscore.split("%")[0];

        db[gameID].steamscore    = steamscore.replace(/\D/g,'');
        db[gameID].steamscoreAlt = $(".game_review_summary", xhr).text();
      }else{
        db[gameID].steamscore    = 0;
        db[gameID].steamscoreAlt = "No score yet";
      }

      // If Metascore
      if($("#game_area_metascore", xhr).length){
        db[gameID].metascore  = $("#game_area_metascore span:first-child", xhr).text(); }

      // Game tags
      var tags = [];
      $(".popular_tags a", xhr).each(function(){ tags.push($(this).text().trim()); });
      db[gameID].tags = tags.slice(0, 20);

      // Features
      $("#category_block .game_area_details_specs a", xhr).each(function(i,e){
        if($(e).attr("href").indexOf("category2=22") == -1){ db[gameID].achievements = false; }

        if($(e).attr("href").indexOf("category2=29") > -1){ db[gameID].cards = true; }
        if($(e).attr("href").indexOf("category2=28") > -1){ db[gameID].controller = true; }
        if($(e).attr("href").indexOf("category2=18") > -1){ db[gameID].controller = true; }

        if($(e).attr("href").indexOf("category2=2")  > -1){ db[gameID].singlePlayer = true; }

        if($(e).attr("href").indexOf("category2=1")  > -1){ db[gameID].multiPlayer = true; }
        if($(e).attr("href").indexOf("category2=27") > -1){ db[gameID].multiPlayer = true; }
        if($(e).attr("href").indexOf("category2=20") > -1){ db[gameID].mmo = true; }

        if($(e).attr("href").indexOf("category2=9")  > -1){ db[gameID].coop = true; }
        if($(e).attr("href").indexOf("category2=24") > -1){ db[gameID].coop = true; db[gameID].localCoop = true; }
      });


    //| Get achievements stats
    //| After complete, autocall function
    //+-------------------------------------------------------
      $.getJSON("http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=" + gameID + "&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=" + user.steamid,
      function(data){
        // execute always to avoid errors 400 given by steam
      })
      .always(function(data){

        // if error code 503 || > 500
        // ececute getGameInfo() again to retry

        // Achievements info if it has
        if(data.hasOwnProperty("playerstats")){
          if(data.playerstats.hasOwnProperty("achievements")){
            var achieved = 0; for(i in data.playerstats.achievements){
              if(data.playerstats.achievements[i].achieved == 1){ achieved++; } }

            db[gameID].achievements = data.playerstats.achievements.length;
            db[gameID].achieved     = achieved;

            // Save mastered status if all achievements.
            if( data.playerstats.achievements.length == achieved){
              if( !db[gameID].status ){ db[gameID].status = "mastered"; }
            }

          }
        }

        howLongToBeatSteam(gameID);
        saveGameInfo(gameID, extra);

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
    for(var i = queue.length - 1; i >= 0; i--){
      if(queue[i] === gameID){
        queue.splice(i, 1);
      }
    }

  }


//+-------------------------------------------------------
//| removeFromQueue()
//| + Removes one game id from the queue
//| + helps removing duplicates and also is much better
//| + than splice(0,1);
//+-------------------------------------------------------
  function saveGameInfo(gameID, extra){

    chrome.storage.local.set({'db': db}, function(){ /* console.warn("db saved", db); */ });
    //console.log("Steam Backlog: Done updating ", gameID, db[gameID]);

    // Callback
    if(isAngular){ $("div[ng-view]").scope().jQueryCallback(); }

    if(isAngular && (extra == "updateGameDetails")){
      $(document.getElementById('game-details')).scope().updateGameDetails();
      return;
    }

    // Iterate again
    removeFromQueue(gameID);
    getGameInfo();
  }
