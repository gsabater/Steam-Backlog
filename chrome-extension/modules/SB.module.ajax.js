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

    console.log("Steam Backlog: Update db");
    window.setTimeout(function(){ updateDB(); }, 15000);

    // stop execution if we don't have any games
    if(!db || Object.keys(db).length == 0){
      console.warn("Steam Backlog: db is empty.");
      return; }

    // First load, order the games by played
    if(!dbTop){
      dbTop = [];
      for(i in db){
        dbTop.push([i,db[i].playtime_forever]); }
        dbTop.sort(function(a, b){ return b[1] - a[1]; });
    }

    var gameID = false;
    var d = new Date();
    var n = d.getTime();

    // Check top list and remove recently updated
    for(var i = 0; i < dbTop.length; i++){
      if((n - db[dbTop[i][0]].updated) < 2592000000 ){
        dbTop.splice(i,1);  //console.log("remove " + dbTop[i][0], db[dbTop[i][0]].name);
      }else{
        gameID = parseInt(dbTop[i][0]);
        if(queue.indexOf(gameID) === -1){ break; }
      }
    }

    // Finally, get info for the selected game
    getGameInfo(gameID);
  }


//+-------------------------------------------------------
//| getGameInfo()
//| + Using queue var containing game IDs
//| + scrapes information from the steam public page
//| + and saves into game db
//+-------------------------------------------------------
  function getGameInfo(concatID){ //console.warn(concatID, queue);

    var gameID = queue[0];
    var d = new Date();
    var n = d.getTime();

    // Add games to queue if requested
    if(concatID){
      if(typeof concatID == "string"){ concatID = [concatID]; }

      var remaining = queue.length;
      queue = queue.concat(concatID);

      if(remaining    === 0){ getGameInfo(); return; }
      if(queue.length >= 20){ getGameInfo(); return; }

      return;
    }

  //| Initial possible exceptions
  //| if queue is empty or recently updated
  //+-------------------------------------------------------

    //stop execution if there is no more ids
    if(queue.length == 0){
      console.log("Steam Backlog: No queue remaining");

      if($("#sb-detected-games-content").hasClass("detecting-games")){
          $('#sb-detected-games-content').html(
              '<div class="sb-close-panel btn_profile_action btn_medium" style="float: right; border:none;"><span>Close</span></div>'
            + 'All untracked games have been added to the extension memory, and some <br>of your most played games have been scanned.<br><br>'
            + 'Why don\'t you take a look at your <a href="'+chrome.extension.getURL("/steam-backlog.html")+'" style="color: #bada55;">Backlog</a> ?</div>'); }

      NProgress.done();
      return;
    }

    //stop execution if the game have been recently updated
    if( db[gameID].hasOwnProperty("updated")){
      if( (n - db[gameID].updated) < 2592000000 ){

      removeFromQueue(gameID);
      getGameInfo();
      return; } }


  //| Initialize scanning process
  //|
  //+-------------------------------------------------------
    console.log("%c Steam Backlog: Scraping " + gameID + " - " + db[gameID].name + " ", 'background: #222; color: #bada55');
    console.warn(((queue.length * 10 ) /100), queue, gameID, db[gameID]);

    $('.sb-add-games-feedback').html("Getting extended information for <strong style='color: #bada55;'>(" + queue.length + ") " + db[gameID].name + "</strong>");
    //NProgress.inc();

  //| Initialize scanning process
  //| Sets flag and initial time vars
  //+-------------------------------------------------------
    $.get( "http://store.steampowered.com/app/" + gameID )
    .done(function(xhr){

      // Clean data to avoid loading extra images
      xhr = xhr.replace(/<img[^>]*>/g,"");

      db[gameID].updated    = n;
      db[gameID].released   = $('.release_date .date', xhr).text();
      db[gameID].steamscore = $(".game_review_summary", xhr).text();

      // If Metascore
      if($("#game_area_metascore", xhr).length){
        db[gameID].metascore  = $("#game_area_metascore span:first-child", xhr).text(); }

      // Game tags
      var tags = [];
      $(".popular_tags a", xhr).each(function(){ tags.push($(this).text().trim()); });
      db[gameID].tags = tags.slice(0, 20);

      // Features
      $("#category_block .game_area_details_specs a", xhr).each(function(i,e){
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
          }
        }

        // Save block
        chrome.storage.local.set({'db': db}, function(){      /* console.warn("db saved", db); */ });
        console.log("Steam Backlog: Done updating ", gameID);

        // Iterate again
        removeFromQueue(gameID);
        getGameInfo();

      });
    });

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
