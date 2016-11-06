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

var v = "0.7.0";
console.log("%c Steam Backlog v" + v + " ", 'background: #222; color: #bada55');

var isAngular = false,    // flag used for the dashboard to make ajax calls

    user    = false,    // chrome.local var
    db      = false,    // chrome.local var

    dbScan  = false,    // Flag used to inform about update in progress
    dbTop   = false,    // Array of top most played games
    hltbs   = false,    // howlongtobeatsteam var

    isOwnProfile = false, // flag if window.location is own profile

    queue   = [],
    QHLTBS  = [],

    options = {
      v: v,
      option: false
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

    // Initialize db fetch
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
        options = (storage.options)? storage.options : window.options;
        user    = (storage.user)? storage.user : {};
        db      = (storage.db)? storage.db : {};
      }

     // Update user information
     // -> module.user
     GetPlayerSummaries();
 }

  //+-------------------------------------------------------
  //| jQuery Actions
  //+-------------------------------------------------------
    $("body").on("click", "#sb-btn-scan-games", function(){
      doFastScan(); });

    $("body").on("click", ".sb-close-panel", function(){
      $(this).closest(".profile_customization").remove(); });

    $("body").on("click", ".profile_flag", function(){
      chrome.storage.local.remove("user",  function(){console.error("removed"); });
      chrome.storage.local.remove("db",    function(){console.error("removed"); });
    });
