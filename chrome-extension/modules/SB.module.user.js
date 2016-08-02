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
//| GetPlayerSummaries()
//| + Checks if there is stored player info, and gets missing
//| + Call himself to complete multiple parts and init
//+-------------------------------------------------------
  function GetPlayerSummaries(){

    console.warn("Steam Backlog: Initial player information", user);

    var player       = $("#global_header a.user_avatar.playerAvatar");
    var playerURL    = player.attr("href").split("steamcommunity.com/")[1];
    var playerAvatar = player.find("img").attr("src").split("/");

  //| Checks user.steamid
  //| Get id from url or ResolveVanityURL
  //+-------------------------------------------------------
    if(!user.steamid){

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

  //| Checks user.info
  //| Get info from GetPlayerSummaries
  //+-------------------------------------------------------
    if(!user.info || (playerAvatar[playerAvatar.length -1] !== user.info.avatar.split("/")[user.info.avatar.split("/").length -1])){

      $.getJSON("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamids="+user.steamid, function(data){
        user.info = data.response.players[0];
        chrome.storage.local.set({'user': user}, function(){
          GetPlayerSummaries();
        });
      });

      return;
    }

  //| Checks if the fastScan is not already done
  //| This is done silently because some user enters the backlog
  //| without a first scan, which gives an error
  //+-------------------------------------------------------
    if(Object.keys(db).length === 0){
      doFastScan("silent");
    }

  //| Check current url, so it loads only on current profile
  //| Or a product page the user owns.
  //+-------------------------------------------------------
    var playerURL = user.info.profileurl.split("steamcommunity.com")[1].replace(/^\/|\/$/g, '').toLowerCase();
    var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();

    if(windowURL.indexOf("app/") > -1){
      gameID = windowURL.split("app/")[1];
      if(db[gameID]){ getGameInfo(gameID); }
    }

    if( windowURL !== playerURL){
      console.warn(windowURL, playerURL);
      return; }

      // detectNewGames(); deprecated
      // updateDB();
  }





//+-------------------------------------------------------
//| doFastScan()
//| + Sets visual feedback for the profile, and calls
//| + doFastScan() and pass to createDB() to build db
//+-------------------------------------------------------
  function doFastScan(silent){

    if(!silent){

      $("#sb-btn-scan-games").hide();
      NProgress.start();

      $('#sb-detected-games-content').addClass("detecting-games").html(
       // '<div id="sb-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Close</span></div>'
       'Adding games, please wait. This won\'t take long.<br><div class="sb-add-games-feedback">&nbsp;</div>');
    }

    //| Get all games by steamid
    //| execute createDB to build db
    //+-------------------------------------------------------
      $.getJSON("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid="+user.steamid+"&include_played_free_games=1&include_appinfo=1&format=json", function(data){
        createDB(data.response, silent);
      });

  }


//+-------------------------------------------------------
//| createDB()
//| + Given the response from doFastScan(),
//| + creates the initial db var that serves as library
//+-------------------------------------------------------
  function createDB(steam, silent){

    var d = new Date();
    var n = d.getTime();

    var topTen   = [];
    var SteamIDs = [];

  //| Iterate over any game in the steam api
  //| and push to db with some initial data
  //+-------------------------------------------------------
    for(var i = 0, len = steam.games.length; i < len; i++){

      e = steam.games[i];
      if(!db.hasOwnProperty(e.appid)){

        topTen.push([e.appid, e.playtime_forever]);
        db[e.appid] = {
          appid: e.appid,
          name: e.name,
          cached: n,
          playtime_forever: e.playtime_forever,
        };

      }
    };

    // fill HLTB information on games 
    howLongToBeatSteam("all");

    if(silent){
      chrome.storage.local.set({'db': db}, function(){ /* console.warn("db saved", db); */ });
    }else{

      // Order all db by playtime_forever
      topTen = topTen.slice(0, 5);
      topTen.sort(function(a, b) {return b[1] - a[1]});
      for(var i = 0; i < topTen.length; i++){
        SteamIDs.push(topTen[i][0]); }

      // getGameInfo() for the most played games
      queue = queue.concat(SteamIDs);
      getGameInfo();

      // Save user information
      user.ownedGames   = steam.games.length;
      var profileGames  = $(".responsive_count_link_area a[href*='games/?tab=all'] span.profile_count_link_total").text().replace(",", "");
      user.profileGames = parseInt(profileGames);

      chrome.storage.local.set({'user': user}, function(){  /* console.warn("User saved", user); */ });
    }
  }
