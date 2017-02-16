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

var v = "0.9.9";
console.log("%c Steam Backlog v" + v + " ", 'background: #222; color: #bada55');

var isAngular    = false,       // flag used to know if the execution is done in the angular panel
    isOwnProfile = false,       // flag used to know if window.location is own profile steam page

    user         = false,            // chrome.local var
    db           = false,            // chrome.local var
    hltbs        = false,            // howlongtobeatsteam var
    savedb       = false,

    queue        = [],          // used to store pending apps waiting to be updated
    timeout      = false,       // identifier to stop updater watch
    isQueue      = false,       // default false, when true means there are games waiting to be updated
    notification = false,       // Contains the text used to inform about current update game and others

    collections  = false,        // chrome.local var
    settings     = {
      v: v,
      scan: {
        interval: "3",
        achievements: false
      },
      library:{
        wishlist: false
      }
    };


  // Initialize app only when needed
  window.setTimeout(function(){
    init();
  }, 50);


//+-------------------------------------------------------
//| init()
//+--------------------------------
//| + gets chrome.local information when needed
//| + Adds layout modifications
//+-------------------------------------------------------
  function init(){

    // Flag if angular app (dashboard / backlog)
    var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    isAngular = (windowURL == "steam-backlog.html")? true : false;

    // Stop if client is not logged in
    if(!$("a.user_avatar.playerAvatar").length){ console.warn("Steam Backlog: User not logged in"); return; }

    // Add backlog menu option
    $('<a class="menuitem" href="'+chrome.extension.getURL("/steam-backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");

    // Initialize localstorage
    initChromeLocal();

    /* // Update notification
    if(parseFloat(options.v) == parseFloat(v)){
      console.warn(options, parseFloat(options.v) , parseFloat(v));
      //sendPush("update", "Mediavida Notifier ha sido actualizada a la versión "+v, true);
    }
    */

  }

  //+-------------------------------------------------------
  //| init()
  //+--------------------------------
  //| + gets chrome.local information when needed
  //| + Sets global db and user vars
  //+-------------------------------------------------------
    function initChromeLocal(storage){

      if(!storage){
        chrome.storage.local.get(null, function(items){
          console.warn("Steam Backlog stored vars", items); initChromeLocal(items); });
          return;
      }else{

        // Set global user and db vars
        db          = (storage.db)? storage.db : {};
        user        = (storage.user)? storage.user : {};
        settings    = (storage.settings)? storage.settings : settings;
        collections = (storage.collections)? storage.collections : false;
      }

     // Update user information
     // -> module.user
     GetPlayerSummaries();
 }
