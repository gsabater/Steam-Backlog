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

//==============================================================
//| GetPlayerSummaries()
//| + Checks if there is stored player info, and gets missing
//| + Call himself to complete multiple parts and init
//==============================================================
  function GetPlayerSummaries(){

    console.warn("Steam Backlog: Available player information", user);

    var player       = $("#global_header a.user_avatar.playerAvatar");
    var playerURL    = player.attr("href").split("steamcommunity.com/")[1];
    var playerAvatar = player.find("img").attr("src").split("/");

  //| Step 1: Check for user.steamid
  //| Resolve from url or ResolveVanityURL
  //+-------------------------------------------------------
    if(!user.steamid){

      if(playerURL.substring(0,9) == "profiles/"){
        user.steamid = playerURL.substring(9, playerURL.length).replace("/", "");
        GetPlayerSummaries();
      }

      if(playerURL.substring(0,3) == "id/"){
        $.getJSON("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&vanityurl=" + playerURL.substring(3, playerURL.length).replace("/", ""), function(data){
          user.steamid = data.response.steamid;
          GetPlayerSummaries();
        });
      }

      return;
    }

  //| Step 2: Check for user.info
  //| Get info from GetPlayerSummaries Steam API
  //| Also update in case the avatar has changed (other logic may be added)
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

  //| Step 3: Flag in a var if the current current url
  //| is the player profile url
  //+-------------------------------------------------------
        playerURL = user.info.profileurl.split("steamcommunity.com")[1].replace(/^\/|\/$/g, '').toLowerCase();
    var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    if( windowURL == playerURL){ isOwnProfile = true; }

  //| Step 4: Check if library has been scanned
  //| If a scan is needed, execute function
  //+-------------------------------------------------------
    if(Object.keys(db).length === 0){
      scanLibrary(); return; }

    if(isOwnProfile && !user.profileGames){
      scanLibrary(); return; }

    var profileGames  = parseInt($(".responsive_count_link_area a[href*='games/?tab=all'] span.profile_count_link_total").text().replace(",", ""));
    if(isOwnProfile && (user.profileGames != profileGames) ){
      scanLibrary(); return; }

  }


//+-------------------------------------------------------
//| scanLibrary()
//| + Check for new games and pass info to createDB();
//+-------------------------------------------------------
  function scanLibrary(games, list){

    games = (games)? games : {};

  //| Step 1: Scan whole app library
  //| then scan for wishlist
  //+-------------------------------------------------------
    if(!list || (list == "library")){
      $.getJSON("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid="+user.steamid+"&include_played_free_games=1&include_appinfo=1&format=json", function(data){
        games = data.response;
        scanLibrary(games, 'wishlist');
        return;
      });
    }

    //| Step 2: Scan dynamicstore for wishlist and recommended tags
    //| save and createDB
    //+-------------------------------------------------------
      if(list == "wishlist"){
        $.getJSON("http://store.steampowered.com/dynamicstore/userdata", function(data){

          user.wishlist = data.rgWishlist;
          user.recommendedTags = data.rgRecommendedTags;

          createDB(games);
          return;
        });
      }

  }


//+-------------------------------------------------------
//| createDB()
//| + Given the response from doFastScan(),
//| + creates the initial db var that serves as library
//+-------------------------------------------------------
  function createDB(steam){

    var d = new Date();
    var n = d.getTime();

  //| Iterate over any game in the steam api
  //| and push to db with some initial data
  //+-------------------------------------------------------
    for(var i = 0, len = steam.games.length; i < len; i++){

      e = steam.games[i];

      if(!db.hasOwnProperty(e.appid)){
        db[e.appid] = {
          appid: e.appid,
          name: e.name,
          cached: n,
          fetch: false,
          playtime_forever: e.playtime_forever,
        };
      }
    }

    user.cached = n;
    user.ownedGames = steam.games.length;

    if(isOwnProfile){
      var profileGames  = $(".responsive_count_link_area a[href*='games/?tab=all'] span.profile_count_link_total").text().replace(",", "");
      user.profileGames = parseInt(profileGames); }

    // Save information into chrome.local
    chrome.storage.local.set({'db': db}, function(){ console.warn("db saved", db); });
    chrome.storage.local.set({'user': user}, function(){ console.warn("user saved", user); });

    // fill HLTB information on games
    //howLongToBeatSteam("all");

  }
