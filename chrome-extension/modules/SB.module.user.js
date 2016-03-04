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

  //| Check that current url is own profile to avoid extra charge
  //| update library if proceeds
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

      detectOwnedGames();
      updateDB();
  }


//+-------------------------------------------------------
//| detectOwnedGames()
//| + Gets owned games from all games and profile number.
//+-------------------------------------------------------
  function detectOwnedGames(){

  //| Get number of owned games
  //| If profile is higher, set a message.
  //+-------------------------------------------------------
    var profileGames = parseInt($("a[href='http://steamcommunity.com/id/Gohrum/games/?tab=all'] span.profile_count_link_total").text());
    user.profileGames = (user.profileGames)? user.profileGames : 0;

    if(user.profileGames < profileGames){
      var newGames = profileGames - parseInt(user.profileGames);

      var scanPanel = ''
      + '<div id="sb-detected-games" class="profile_customization">'
        + '<a class="profile_customization_editlink" href="http://steamcommunity.com/id/Gohrum/edit#showcases">'
        + '<span class="profile_customization_editlink_text">Disable automatic detection</span></a>'
      + '<div class="profile_customization_header ellipsis">New untracked games</div>'
      + '<div class="profile_customization_block"><div id="sb-detected-games-bar" class="customtext_showcase">'
      + '<div id="sb-detected-games-content" class="showcase_content_bg showcase_notes" style="line-height: 17px;">'
        + '<div id="sb-btn-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Sure</span></div>'
        + 'Looks like you have <span style="color: #bada55;">' + newGames + '</span> new games.<br>'
        + 'Do you want Steam Backlog to track them now?' //<span style="background: #222; color: #bada55;padding: 0 5px;">Steam Backlog</span>
      + '</div></div></div></div>';

      $(".profile_customization_area").prepend(scanPanel);

    }

    // On click, execute getOwnedGames
  }


//+-------------------------------------------------------
//| getOwnedGames()
//| + Sets visual feedback for the profile, and calls
//| + GetOwnedGames() and pass to createDB() to build db
//+-------------------------------------------------------
  function getOwnedGames(){

    $("#sb-btn-scan-games").hide();
    NProgress.start();

    $('#sb-detected-games-content').addClass("detecting-games").html(
     // '<div id="sb-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Close</span></div>'
     'Adding games, please wait. This won\'t take long.<br><div class="sb-add-games-feedback">&nbsp;</div>');

  //| Get all games by steamid
  //| execute createDB to build db
  //+-------------------------------------------------------
    $.getJSON("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid="+user.steamid+"&include_played_free_games=1&include_appinfo=1&format=json", function(data){
      createDB(data.response);
    });

  }


//+-------------------------------------------------------
//| createDB()
//| + Given the response from GetOwnedGames(),
//| + creates the initial db var that serves as library
//+-------------------------------------------------------
  function createDB(xhr){

    var d = new Date();
    var n = d.getTime();

    var topTen   = [];
    var SteamIDs = [];

  //| iterate over all GetOwnedGames() ids
  //| and push to db with time info
  //+-------------------------------------------------------
    for(var i = 0, len = xhr.games.length; i < len; i++){

      e = xhr.games[i];
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

    // Order all db by playtime_forever
    topTen.sort(function(a, b) {return b[1] - a[1]});
    for(var i = 0; i < topTen.length; i++){
      SteamIDs.push(topTen[i][0]); }

    // getGameInfo() for the first ten most played games
    SteamIDs = SteamIDs.slice(0, 15);
    queue = queue.concat(SteamIDs);

    getGameInfo();

    // Set properties
    user.ownedGames = xhr.games.length;
    user.profileGames = parseInt($("a[href='http://steamcommunity.com/id/Gohrum/games/?tab=all'] span.profile_count_link_total").text());

    chrome.storage.local.set({'user': user}, function(){  /* console.warn("User saved", user); */ });
  }
