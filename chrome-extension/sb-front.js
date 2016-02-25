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

var v = "0.3";
console.log("%c Steam Backlog v" + v + " ", 'background: #222; color: #bada55');

// Init localstorage
window.setTimeout(function(){
  chrome.storage.local.get(null, function(items){ init(items); });
}, 50);

/*
else get user data and set it on localstorage - warning if private -
check if user profile is owner
---
get played games in last two weeks
if one game has > 5h and is not in currently playing games -> show message
message options: yes, add it to currently playing games / nope, just idling for cards.
*/

var user   = false,
    db     = false,
    dbTop  = false,

  settings = {
    option: false
  };

  //+-------------------------------------------------------
  //| init()
  //+--------------------------------
  //| + Sets global db and user vars
  //| + Adds menu option
  //+-------------------------------------------------------
    function init(storage){

      //chrome.storage.local.remove("user",  function(){console.error("removed"); });
      //chrome.storage.local.remove("db",    function(){console.error("removed"); });
      //return false;
      //console.warn(storage);

      NProgress.configure({ parent: '#sb-detected-games-bar', trickleRate: 0.02 });

      // Stop execution if client is not logged in
      if(!$("a.user_avatar.playerAvatar").length){ console.error("Backlog: User not logged in"); return; }

      // Add backlog menu option
      $('<a class="menuitem" href="'+chrome.extension.getURL("/backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");
     
      // Set global user and db vars
      user = (storage.user)? storage.user : {};
      db   = (storage.db)? storage.db : {};

      // Update user information 
      GetPlayerSummaries();

    }


  //+-------------------------------------------------------
  //| GetPlayerSummaries()
  //| + Checks if stored info is from known user
  //| + else, gets extended user info and stores
  //+-------------------------------------------------------
    function GetPlayerSummaries(){

      console.warn("Player Summaries", user);

      //| Get SteamID
      //+-------------------------------------------------------      
        if(!user.steamid){

          var player    = $("#global_header a.user_avatar.playerAvatar");
          var playerURL = player.attr("href").split("steamcommunity.com/")[1];

          if(playerURL.substring(0,9) == "profiles/"){
            user.steamid = playerURL.substring(9, playerURL.length).replace("/", "");
            GetPlayerSummaries();
            //$('<div>User ID: '+ playerURL.substring(9, playerURL.length).replace("/", "") + '</div>').appendTo(".profile_header_centered_persona");
          }

          if(playerURL.substring(0,3) == "id/"){
            $.getJSON("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&vanityurl=" + playerURL.substring(3, playerURL.length).replace("/", ""), function(data){
              //$('<div>User ID: '+ data.response.steamid + '</div>').appendTo(".profile_header_centered_persona");
              user.steamid = data.response.steamid;
              GetPlayerSummaries();
            });
          }

          return;
        }

      //| Get user info from steam API
      //+-------------------------------------------------------           
        if(!user.info){
          $.getJSON("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamids="+user.steamid, function(data){
            user.info = data.response.players[0];
            chrome.storage.local.set({'user': user}, function(){ 
              GetPlayerSummaries(); 
            });
          });

          return;
        }

      //| Check that url is own profile to avoid extra charge
      //| and update library
      //+-------------------------------------------------------
        var playerURL = user.info.profileurl.split("steamcommunity.com")[1].replace(/^\/|\/$/g, '').toLowerCase();
        var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();

        if( windowURL !== playerURL){
          console.warn(windowURL, playerURL);
          return; }

          detectOwnedGames();
          updateDB();
    }


  //+-------------------------------------------------------
  //| detectOwnedGames()
  //| + Gets owned games from all games and profile number.
  //+-------------------------------------------------------
    function detectOwnedGames(){
    
      // Get number of owned games
      // If profile is higher, set a message.
      var profileGames = parseInt($("a[href='http://steamcommunity.com/id/Gohrum/games/?tab=all'] span.profile_count_link_total").text());
      user.profileGames = (user.profileGames)? user.profileGames : 0;
      
      if(user.profileGames < profileGames){
        var newGames = profileGames - parseInt(user.profileGames);

        var scanPanel = ''
        + '<div id="sb-detected-games" class="profile_customization">'
        + '<a class="profile_customization_editlink" href="http://steamcommunity.com/id/Gohrum/edit#showcases">'
        + '<span class="profile_customization_editlink_text">Disable automatic detection</span></a>'
        + '<div class="profile_customization_header ellipsis">New untracked games</div>'
        + '<div class="profile_customization_block"><div class="customtext_showcase">'
        + '<div id="sb-detected-games-bar" class="showcase_content_bg showcase_notes" style="line-height: 17px;">'
        + '<div id="sb-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Sure</span></div>'        
        + 'Looks like you have <span style="color: #bada55;">' + newGames + '</span> new games.<br>'
        + 'Do you want Steam Backlog to track them now?' //<span style="background: #222; color: #bada55;padding: 0 5px;">Steam Backlog</span>
        + '</div></div></div></div>';

        $(".profile_customization_area").prepend(scanPanel);

      }
    }


  //+-------------------------------------------------------
  //| updateDB()
  //| + updates database for each game every once in a while
  //+-------------------------------------------------------
    function updateDB(){

      // stop execution if we don't have any games
      if(db.length == 0){
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

      // Check every game and remove recently updated
      for(var i = 0; i < dbTop.length; i++){

        if((n - db[dbTop[i][0]].updated) < 2592000000 ){
          //console.log("remove " + dbTop[i][0], db[dbTop[i][0]].name);
          dbTop.splice(i,1);
        }else{
          gameID = dbTop[i][0];
          break;
        }

      }

      // Get info for the winner
      getGameInfo(gameID);

      window.setTimeout(function(){ updateDB(); }, 30000);

    }


  //+-------------------------------------------------------
  //| getOwnedGames()
  //| + Gets owned games from all games and profile number.
  //+-------------------------------------------------------
    function getOwnedGames(){

      //Visual feedback for process
      $("#sb-scan-games").hide();
      NProgress.start();

      $('#sb-detected-games-bar').addClass("detecting-games").html(
       // '<div id="sb-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Close</span></div>'        
       'Adding games, please wait. This won\'t take long.<br><div class="sb-add-games-feedback">&nbsp;</div>');

      // Get all games and iterate them
      $.getJSON("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid="+user.steamid+"&include_played_free_games=1&include_appinfo=1&format=json", function(data){    
        mergeGames(data.response);
      });

    }

  //+-------------------------------------------------------
  //| mergeGames()
  //| + Given a collection of games, iterates them and syncs
  //+-------------------------------------------------------
    function mergeGames(xhr){

      var d = new Date();
      var n = d.getTime();

      var topTen   = [];
      var SteamIDs = [];

      // First, insert any not already processed game into db
      for(var i = 0, len = xhr.games.length; i < len; i++){
        e = xhr.games[i];
        
        //if(!db[e.appid]){
        if(!db.hasOwnProperty(e.appid)){

          topTen.push([e.appid, e.playtime_forever]);
          db[e.appid] = {

            name: e.name,
            cached: n,
            updated: null,
            released: null,

            playtime_forever: e.playtime_forever,
            achievements: null,
            achieved: null,

            metascore: null,
            userscore: null,
            steamscore: null,
            tags: null,
            controller: null,

            hltb: {
              main: null,
              extras: null,
              completionist: null
            },

            categories: {
              singlePlayer: null,
              multiPlayer: null,
              mmo: null,
              coop: null,
              localCoop: null
            },

            status: {
              playing: false,
              loved: false,
              completed: false,
              mastered: false,
              dominated: false,
              shelved: false
            },

            notes: ""

          };          

        }
      };

      // Once the new games are set, get the top ten new games
      topTen.sort(function(a, b) {return b[1] - a[1]});
      for(var i = 0; i < topTen.length; i++){
        SteamIDs.push(topTen[i][0]); }

      // Get info for the included array of games
      SteamIDs = SteamIDs.slice(0, 10);
      getGameInfo(SteamIDs);

      // Set properties
      user.ownedGames = xhr.games.length;
      user.profileGames = parseInt($("a[href='http://steamcommunity.com/id/Gohrum/games/?tab=all'] span.profile_count_link_total").text());

      chrome.storage.local.set({'user': user}, function(){  /* console.warn("User saved", user); */ });
    }


  //+-------------------------------------------------------
  //| getGameInfo()
  //| + Get fucking everything from a list of games
  //+-------------------------------------------------------
    function getGameInfo(SteamIDs){
      
      // This function works with an array of IDs.
      // If a single ID is provided, convert this
      if(typeof SteamIDs == "string"){ SteamIDs = [SteamIDs]; }
      if(!SteamIDs || SteamIDs.length == 0){
        
        if($("#sb-detected-games-bar").hasClass("detecting-games")){
          $('#sb-detected-games-bar').html(
              '<div class="sb-close-panel btn_profile_action btn_medium" style="float: right; border:none;"><span>Close</span></div>'        
            + 'All untracked games have been added to the extension memory<br>Feel free to pick your next game!</div>');

          NProgress.done();
        }

        return;
      }

      var d = new Date();
      var n = d.getTime();

      console.log(SteamIDs);
      console.log("%c search for " + SteamIDs[0] + " - " + db[SteamIDs[0]].name, 'background: #222; color: #bada55');
      $('.sb-add-games-feedback').html("Getting information for <strong style='color: #bada55;'>" + db[SteamIDs[0]].name + "</strong>");

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


        // Get achievements stats.
        $.getJSON("http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=" + SteamIDs[0] + "&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=" + user.steamid, 
          function(data){ 
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
          chrome.storage.local.set({'user': user}, function(){  /* console.warn("User saved", user); */ });
          chrome.storage.local.set({'db': db}, function(){      /* console.warn("db saved", db); */ });

          // Iterate again
          SteamIDs.splice(0,1);
          getGameInfo(SteamIDs);          

        });
      });
      
    }

  //+-------------------------------------------------------
  //| jQuery Actions
  //+-------------------------------------------------------

  //+-------------------------------------------------------
  //| #sb-scan-games
  //| Start getOwnedGames
  //+-------------------------------------------------------
    $("body").on("click", "#sb-scan-games", function(){
      getOwnedGames(); });

    $("body").on("click", ".sb-close-panel", function(){
      $(this).closest(".profile_customization").remove(); });

    $("body").on("click", "[src='http://steamcommunity-a.akamaihd.net/economy/emoticon/csgox']", function(){
      chrome.storage.local.remove("user",  function(){console.error("removed"); });
      chrome.storage.local.remove("db",    function(){console.error("removed"); }); 
    });