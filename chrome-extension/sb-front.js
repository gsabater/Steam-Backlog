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

var v = "0.1";
console.log("%c Steam Backlog v " + v + " ", 'background: #222; color: #bada55');

// Init localstorage
window.setTimeout(function(){
  chrome.storage.sync.get(null, function(items){ init(items); });
}, 50);

/*

check user localstorage if set
else get user data and set it on localstorage - warning if private -
check if user profile is owner
---
get played games in last two weeks
if one game has > 5h and is not in currently playing games -> show message
message options: yes, add it to currently playing games / nope, just idling for cards.
---
get games number (frontend)
if number is higher, prompt a message for update the extension database.
if yes, get owned games, search for not saved ones, and get detailed info
then save to localstorage
*/

var userID = false;
var user   = false,
    db     = false,

  settings = {
    option: false
  };

  //+-------------------------------------------------------
  //| init()
  //+--------------------------------
  //| + Gets the Steam User ID 
  //| + Adds menu option
  //+-------------------------------------------------------
    function init(storage){

      //chrome.storage.sync.remove("value", function(){console.log("removed"); });
      //chrome.storage.sync.remove("user", function(){console.log("removed"); });
      //return false;

      console.warn("0", storage);
      NProgress.configure({ parent: '#sb-detected-games-bar' });

      // Stop execution if client is not logged in
      if(!$("a.user_avatar.playerAvatar").length){ return; }

      // Add backlog menu option
      $('<a class="menuitem" href="'+chrome.extension.getURL("/backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");
     
      // Set global user and db vars
      user = (storage.user)? storage.user : {};
      //db   = (storage)? storage : [];

      // Get user id and check 
      GetPlayerSummaries();

    }


  //+-------------------------------------------------------
  //| GetPlayerSummaries()
  //| + Checks if stored info is from known user
  //| + else, gets extended user info and stores
  //+-------------------------------------------------------
    function GetPlayerSummaries(){

      console.log("Player Summaries", user);

      //| First, check user SteamID
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
            console.log(data.response, user);

            chrome.storage.sync.set({'user': user}, function(){ 
              console.warn("User saved", user); 
              GetPlayerSummaries(); 
            });

          });

          return;
        }

      console.log("finished", user, db);

      //| Once we know who you are, lets get your games.
      //+-------------------------------------------------------   
        detectOwnedGames();

    }

  //+-------------------------------------------------------
  //| detectOwnedGames()
  //| + Gets owned games from all games and profile number.
  //+-------------------------------------------------------
    function detectOwnedGames(){
      
      // first check that url is own profile
      // to avoid extra charge and calling on every page
      var playerURL = user.info.profileurl.split("steamcommunity.com")[1].replace(/^\/|\/$/g, '').toLowerCase();
      var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();

      console.warn(windowURL, playerURL);
      if( windowURL !== playerURL){
        return; }

      // Get number of owned games
      // If profile is higher, set a message.
      var profileGames = parseInt($("a[href='http://steamcommunity.com/id/Gohrum/games/?tab=all'] span.profile_count_link_total").text());
      user.profileGames = (user.profileGames)? user.profileGames : 0;
      
      if(user.profileGames < profileGames){
        console.warn("yeah", user.profileGames, profileGames);
        var newGames = profileGames - parseInt(user.profileGames);
        console.log(newGames, profileGames, parseInt(user.profileGames) , user.profileGames);
          
        var scanPanel = ''
        + '<div id="sb-detected-games" class="profile_customization">'
        + '<a class="profile_customization_editlink" href="http://steamcommunity.com/id/Gohrum/edit#showcases">'
        + '<span class="profile_customization_editlink_text">Disable automatic detection</span></a>'
        + '<div class="profile_customization_header ellipsis">New untracked games</div>'
        + '<div class="profile_customization_block"><div class="customtext_showcase">'
        + '<div id="sb-detected-games-bar" class="showcase_content_bg showcase_notes" style="line-height: 17px;">'
        + '<div id="sb-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Sure</span></div>'        
        + 'Looks like you have <span style="color: #bada55;">' + newGames + '</span> new untracked games.<br>'
        + 'Do you want Steam Backlog to track them for you?' //<span style="background: #222; color: #bada55;padding: 0 5px;">Steam Backlog</span>
        + '<div id="sb-feedback"></div>'
        + '</div></div></div></div>';

        $(".profile_customization_area").prepend(scanPanel);

      }
    }

  //+-------------------------------------------------------
  //| getOwnedGames()
  //| + Gets owned games from all games and profile number.
  //+-------------------------------------------------------
    $("body").on("click", "#sb-scan-games", function(){
      getOwnedGames();
    });


  //+-------------------------------------------------------
  //| getOwnedGames()
  //| + Gets owned games from all games and profile number.
  //+-------------------------------------------------------
    function getOwnedGames(){

      //Visual feedback for process
      $("#sb-scan-games").hide();
      NProgress.start();

      $.getJSON("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid="+user.steamid+"&format=json", function(data){    
          console.warn(data);

          for(var i = 0, len = data.response.games.length; i < len; i++){ 
            e = data.response.games[i];
            $("#sb-feedback").html($("#sb-feedback").html() + e.appid +"<br>");
          };

        });

    }
/*
  user.profileGames = profileGames;
  chrome.storage.sync.set({'user': user}, function(){ console.warn("User saved", user); });
*/