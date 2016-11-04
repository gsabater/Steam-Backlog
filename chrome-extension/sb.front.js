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

var isAngular = false,    // A flag in dashboard used in callbacks

    user    = false,    // Main user chrome.local var
    db      = false,    // Main games chrome.local var

    dbScan  = true,     // Flag used to inform about updating
    dbTop   = false,    // Array of top 5 most played games
    hltbs   = false,    // howlongtobeatsteam ajax container

    queue   = [],
    QHLTBS  = [],

    options = {
      v: v,
      option: false
    };


  // Initialize app by local data
  window.setTimeout(function(){
    chrome.storage.local.get(null, function(items){ console.warn(items); init(items); });
  }, 50);


//+-------------------------------------------------------
//| init()
//+--------------------------------
//| + Sets global db and user vars
//| + Adds menu option
//+-------------------------------------------------------
  function init(storage){

    return false;

    NProgress.configure({
      parent: '#sb-detected-games-bar',
      //trickleRate: 0.02,
      //trickleSpeed: 1000,
      //speed: 100
    });

    // Flag execution in dashboard
    var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    isAngular = (windowURL == "steam-backlog.html")? true : false;

    // Stop execution if client is not logged in
    if(!$("a.user_avatar.playerAvatar").length){ console.warn("Steam Backlog: User not logged in"); return; }

    // Add backlog menu option
    $('<a class="menuitem" href="'+chrome.extension.getURL("/steam-backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");

    // Set global user and db vars
    options = (storage.options)? storage.options : window.options;
    user    = (storage.user)? storage.user : {};
    db      = (storage.db)? storage.db : {};

    /* // Update notification
    if(parseFloat(options.v) == parseFloat(v)){
      console.warn(options, parseFloat(options.v) , parseFloat(v));
      //sendPush("update", "Mediavida Notifier ha sido actualizada a la versión "+v, true);
    }
    */

    // Update user information
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
