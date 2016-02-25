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
        dbTop.sort(function(a, b) {return b[1] - a[1]});

    }


    var gameID = false;
    var d = new Date();
    var n = d.getTime();

    // Check top list and remove recently updated
    for(var i = 0; i < dbTop.length; i++){

      if((n - db[dbTop[i][0]].updated) < 2592000000 ){
        dbTop.splice(i,1);  //console.log("remove " + dbTop[i][0], db[dbTop[i][0]].name);
      }else{
        gameID = dbTop[i][0];
        break;
      }

    }

    // Finally, get info for the selected game
    getGameInfo(gameID);

  }


//+-------------------------------------------------------
//| getGameInfo()
//| + Given an array of games or a game ID
//| + scrapes information from the steam public page
//| + and saves into game db
//+-------------------------------------------------------
  function getGameInfo(SteamIDs){
    
    if(typeof SteamIDs == "string"){ SteamIDs = [SteamIDs]; }
    
    // stop execution if already scanning
    if(scan){ 
      console.log("Steam Backlog: Another scan is in progress", SteamIDs);
      window.setTimeout(function(){ getGameInfo(SteamIDs); }, 2000); 
      return; }

    //stop execution if there is no more ids
    if(!SteamIDs || SteamIDs.length == 0){
      console.log("Steam Backlog: No SteamIDs remaining", SteamIDs);
      if($("#sb-detected-games-content").hasClass("detecting-games")){
        
        scan = false;
        NProgress.done();

        $('#sb-detected-games-content').html(
            '<div class="sb-close-panel btn_profile_action btn_medium" style="float: right; border:none;"><span>Close</span></div>'        
          + 'All untracked games have been added to the extension memory<br>Feel free to pick your next game!</div>'); }
      
      return; }
    

  //| Initialize scanning process
  //| Sets flag and initial time vars
  //+-------------------------------------------------------
    scan = true;
    var d = new Date();
    var n = d.getTime();

    console.log("%c Steam Backlog: Scraping " + SteamIDs[0] + " - " + db[SteamIDs[0]].name + " ", 'background: #222; color: #bada55');
    console.log(SteamIDs);

    $('.sb-add-games-feedback').html("Getting information for <strong style='color: #bada55;'>" + db[SteamIDs[0]].name + "</strong>");


  //| Initialize scanning process
  //| Sets flag and initial time vars
  //+-------------------------------------------------------
    $.get( "http://store.steampowered.com/app/" + SteamIDs[0] )
    .done(function(xhr){
      
      db[SteamIDs[0]].released   = $('.release_date .date', xhr).text();
      db[SteamIDs[0]].steamscore = $(".game_review_summary", xhr).text();

      // If Metascore
      if($("#game_area_metascore", xhr).length){ 
        db[SteamIDs[0]].metascore  = $("#game_area_metascore span:first-child", xhr).text(); }

      // Game tags
      var tags = [];
      $(".popular_tags a", xhr).each(function(){ tags.push($(this).text().trim()); });
      db[SteamIDs[0]].tags = tags.slice(0, 10);

      // Features
      $("#category_block .game_area_details_specs a", xhr).each(function(i,e){
        if($(e).attr("href").indexOf("category2=28") > -1){ db[SteamIDs[0]].controller = true; }
        if($(e).attr("href").indexOf("category2=18") > -1){ db[SteamIDs[0]].controller = true; }

        if($(e).attr("href").indexOf("category2=2")  > -1){ db[SteamIDs[0]].singlePlayer = true; }

        if($(e).attr("href").indexOf("category2=1")  > -1){ db[SteamIDs[0]].multiPlayer = true; }
        if($(e).attr("href").indexOf("category2=27") > -1){ db[SteamIDs[0]].multiPlayer = true; }
        if($(e).attr("href").indexOf("category2=20") > -1){ db[SteamIDs[0]].mmo = true; }

        if($(e).attr("href").indexOf("category2=9")  > -1){ db[SteamIDs[0]].coop = true; }
        if($(e).attr("href").indexOf("category2=24") > -1){ db[SteamIDs[0]].coop = true; db[SteamIDs[0]].localCoop = true; }
      });


    //| Get achievements stats
    //| After complete, autocall function
    //+-------------------------------------------------------
      $.getJSON("http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=" + SteamIDs[0] + "&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=" + user.steamid, 
      function(data){
        // execute always to avoid errors 400 given by steam
      })
      .always(function(data){
        
        // Achievements info if it has
        if(data.hasOwnProperty("playerstats")){
          if(data.playerstats.hasOwnProperty("achievements")){
            var achieved = 0; for(i in data.playerstats.achievements){
              if(data.playerstats.achievements[i].achieved == 1){ achieved++; } }

            db[SteamIDs[0]].achievements = data.playerstats.achievements.length;
            db[SteamIDs[0]].achieved     = achieved;
          }
        }

        // Save block
        db[SteamIDs[0]].updated = n;
        chrome.storage.local.set({'db': db}, function(){      /* console.warn("db saved", db); */ });
        console.log("Steam Backlog: Done updating ", SteamIDs[0]);

        // Iterate again
        scan = false;
        SteamIDs.splice(0,1);
        getGameInfo(SteamIDs);

      });
    });
    
  }