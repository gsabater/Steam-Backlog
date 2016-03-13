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

var v = "0.6.1";
console.log("%c Steam Backlog v" + v + " ", 'background: #222; color: #bada55');

var angular = false,    // A flag in dashboard used in callbacks

    user    = false,    // Main user chrome.local var
    db      = false,    // Main games chrome.local var

    dbScan  = true,     // Flag used to inform about updating
    dbTop   = false,    // Array of top 5 most played games
    hltbs   = false,    // howlongtobeatsteam ajax container

    queue   = [],
    QHLTBS  = [],

  settings = {
    option: false
  };


  // Initialize app by local data
  window.setTimeout(function(){
    chrome.storage.local.get(null, function(items){ init(items); });
  }, 50);


//+-------------------------------------------------------
//| init()
//+--------------------------------
//| + Sets global db and user vars
//| + Adds menu option
//+-------------------------------------------------------
  function init(storage){

    NProgress.configure({
      parent: '#sb-detected-games-bar',
      //trickleRate: 0.02,
      //trickleSpeed: 1000,
      //speed: 100
    });

    // Flag execution in dashboard
    var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    angular = (windowURL == "steam-backlog.html")? true : false;

    // Stop execution if client is not logged in
    if(!$("a.user_avatar.playerAvatar").length){ console.warn("Steam Backlog: User not logged in"); return; }

    // Add backlog menu option
    $('<a class="menuitem" href="'+chrome.extension.getURL("/steam-backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");

    // Set global user and db vars
    games = (storage.games)? storage.games : {};
    user  = (storage.user)? storage.user : {};
    db    = (storage.db)? storage.db : {};

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
