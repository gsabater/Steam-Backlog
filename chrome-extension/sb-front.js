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

console.warn("Steam Backlog active");

init();

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

  //+-------------------------------------------------------
  //| init()
  //+--------------------------------
  //| + Gets the Steam User ID 
  //| + inits localstorage *
  //| + Adds menu option
  //+-------------------------------------------------------
    function init(){
      
      // Add backlog menu option
      $('<a class="menuitem" href="'+chrome.extension.getURL("/backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");
      
      // Get user id and check 
      getPlayerID();

      // Init localstorage
      window.setTimeout(function(){ 
        chrome.storage.sync.get("SB-settings", function(result){ SBStorage(result); });
        chrome.storage.sync.get("SB-games", function(result){ SBStorage(result); });
      }, 100);

    }

  //+-------------------------------------------------------
  //| SBStorage()
  //| + Inits user settings
  //+-------------------------------------------------------
    function SBStorage(localstorage){

if(false){
  chrome.storage.sync.set({'value': theValue}, function() {
          // Notify that we saved.
          message('Settings saved');
        });
}
      console.warn(localstorage);
      return false;

      if(localstorage['MVN-user']){
        for(option in localstorage['MVN-user']){
          user[option] = localstorage['MVN-user'][option]; }
          _audio.src = "assets/" + user.audio;
      }

      if(!localstorage['MVN-user'] || (localstorage['MVN-user'].v < v)){ 
        setMVNStorage(user);
        notifications['update'] = {url: chrome.extension.getURL("") + 'foro/mediavida/mediavida-notifier-chrome-extension-541508'};
        sendPush("update", "Mediavida Notifier ha sido actualizada a la versión "+v, true); 
      }

      console.log(user);
    }

  //+-------------------------------------------------------
  //| setMVNStorage()
  //| + Sets user settings
  //+-------------------------------------------------------
    function setMVNStorage(ls, options){
      if(options){
        for(i in ls){ user[i] = ls[i]; }
      }

      user.v = v;
      var obj = {};
      obj['MVN-user'] = user;

      chrome.storage.local.set(obj);
      if(user.audio){ _audio.src = "assets/" + user.audio; }

      console.log("Setting", obj);
    }


    function getPlayerID(){
      var player    = $("#global_header a.user_avatar.playerAvatar");
      var playerURL = player.attr("href").split("steamcommunity.com/")[1];
      //var playerURL = "http://steamcommunity.com/profiles/76561198063583863".split("steamcommunity.com/")[1];

      if(playerURL.substring(0,9) == "profiles/"){ 
        //return playerURL.substring(9, playerURL.length).replace("/", "");
        $('<div>User ID: '+ playerURL.substring(9, playerURL.length).replace("/", "") + '</div>').appendTo(".profile_header_centered_persona");
      }

      if(playerURL.substring(0,3) == "id/"){
        $.getJSON("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=A594C3C2BBC8B18CB7C00CB560BA1409&vanityurl=" + playerURL.substring(3, playerURL.length).replace("/", ""), function(data){
          $('<div>User ID: '+ data.response.steamid + '</div>').appendTo(".profile_header_centered_persona");
        });
      }

    }