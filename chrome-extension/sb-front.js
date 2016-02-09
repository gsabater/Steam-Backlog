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

// A594C3C2BBC8B18CB7C00CB560BA1409

console.warn("Steam Backlog active");

init();

var userID = false;

  //+-------------------------------------------------------
  //| init()
  //+--------------------------------
  //| + Gets the Steam User ID 
  //| + inits localstorage *
  //| + Adds menu option
  //+-------------------------------------------------------
    function init(){
      
      $('<a class="menuitem" href="https://help.steampowered.com/">BACKLOG</a>').insertAfter(".menuitem.supernav.username");
      
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