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
    options = (storage.options)? storage.options : window.options;
    games   = (storage.games)? storage.games : {};
    user    = (storage.user)? storage.user : {};
    db      = (storage.db)? storage.db : {};

    // Update notification
    if(parseFloat(options.v) == parseFloat(v)){
      console.warn(options, parseFloat(options.v) , parseFloat(v));

      //sendPush("update", "Mediavida Notifier ha sido actualizada a la versión "+v, true);
    }

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

  //+-------------------------------------------------------
  //| sendPush()
  //| + Sends a notification to the browser with details
  //+-------------------------------------------------------
    function sendPush(notID, text, badge, subtext){

      if(!badge){ _num++; }

      var options = {
        type: "basic",
        iconUrl: "/assets/icon38.png",

        title: "Mediavida Notifier",
        message: text,
        contextMessage: (subtext)? (subtext.charAt(0).toUpperCase() + subtext.slice(1)) : "",

        priority: 2,
        /*
        buttons: [{
            title: "Yes, get me there",
            iconUrl: "/assets/MVN_128x128.png"
        }, {
            title: "Get out of my way",
            iconUrl: "/assets/MVN_128x128.png"
        }]
        */
      }

      chrome.notifications.create(notID, options);

      window.setTimeout(function(){ updatePush(notID); }, 4000);
      window.setTimeout(function(){ clearNotification(notID); }, 10000);
    }
/*
  //+-------------------------------------------------------
  //| updatePush()
  //| + Updates the options so the update lasts longer
  //+-------------------------------------------------------
    function updatePush(notID){
      var options = { priority: 1, }
      chrome.notifications.update(notID, options);
    }


  //+-------------------------------------------------------
  //| pushAction()
  //| + Opens link and deletes notification from center
  //+-------------------------------------------------------
    function pushAction(notificationId){

      clearNotification(notificationId);

      var base = chrome.extension.getURL("");
      var url = "http://www.mediavida.com/"+notifications[notificationId].url.split(base)[1];
      chrome.tabs.create({"url":url,"selected":true});
    }


  //+-------------------------------------------------------
  //| clearNotification()
  //| + Removes the notification from the action center and 
  //| + fades the audio background.
  //+-------------------------------------------------------
    function clearNotification(notificationId){
      chrome.notifications.clear(notificationId);
    }


  //| + Multiple event listeners for chrome runtime
  //+-------------------------------------------------------
    chrome.notifications.onClicked.addListener(pushAction);
    chrome.notifications.onClosed.addListener(clearNotification);
    
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
      console.log("+ MVN: Message event", request);

      if (request.options)            { setMVNStorage(request.options, true); }
      if (request.mvnLS)              { setStorage(request.mvnLS); }

      if (request.clear == "0")       { _num = 0; chrome.browserAction.setBadgeText({text:""}); }
      if (request.test == "true")     { sendPush(Math.floor((Math.random() * 100) + 1).toString(), "Prueba de notificación", true, "Ahora mismo"); }
      if (request.mvnBadge == "num")  { sendResponse({farewell: _num}); }

      if (request.getUser == "object"){ sendResponse({farewell: user}); }
      if (request.getUser == "full")  { sendResponse({user: user, ls: mvnLS}); }
    });
*/