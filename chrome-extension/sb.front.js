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

var v = "0.3";
console.log("%c Steam Backlog v" + v + " ", 'background: #222; color: #bada55');

var user   = false,
    db     = false,
    dbTop  = false,
    queue  = [],

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
      trickleRate: 0.02,
      trickleSpeed: 1000,
      speed: 100
    });

    // Stop execution if client is not logged in
    if(!$("a.user_avatar.playerAvatar").length){ console.error("Steam Backlog: User not logged in"); return; }

    // Add backlog menu option
    $('<a class="menuitem" href="'+chrome.extension.getURL("/backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");
   
    // Set global user and db vars
    user = (storage.user)? storage.user : {};
    db   = (storage.db)? storage.db : {};

    // Update user information 
    GetPlayerSummaries();

  }


  //+-------------------------------------------------------
  //| jQuery Actions
  //| Start getOwnedGames
  //+-------------------------------------------------------
    $("body").on("click", "#sb-btn-scan-games", function(){
      getOwnedGames(); });

    $("body").on("click", ".sb-close-panel", function(){
      $(this).closest(".profile_customization").remove(); });

    $("body").on("click", "[src='http://steamcommunity-a.akamaihd.net/economy/emoticon/csgox']", function(){
      chrome.storage.local.remove("user",  function(){console.error("removed"); });
      chrome.storage.local.remove("db",    function(){console.error("removed"); }); 
    });