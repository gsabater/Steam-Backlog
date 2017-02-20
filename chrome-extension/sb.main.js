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

var v = "1.0";
console.log("%c Steam Backlog v" + v + " ", 'background: #222; color: #bada55');

var isAngular    = false,       // flag used to know if the execution is done in the angular panel
    isOwnProfile = false,       // flag used to know if window.location is own profile steam page

    user         = false,       // chrome.local var
    db           = false,       // chrome.local var
    hltbs        = false,       // howlongtobeatsteam var
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
            wishlist: true
        }
    },

    // Configuration object.
    // Edit this values to customize how the extension behaves
    config = {
        notifyUpdate: true,
        updateAppAfter: 2592000000, // 30 days
        resyncAfter: 86400000,
        batchSize: 116,
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
function init()
{

    // Flag when inside the angular app
    var windowURL = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    isAngular = (windowURL == "steam-backlog.html")? true : false;

    // Stop if client is not logged in
    if(!$("a.user_avatar.playerAvatar").length){ console.warn("Steam Backlog: User not logged in"); return; }

    // Add backlog menu option
    $('<a class="menuitem" href="'+chrome.extension.getURL("/steam-backlog.html")+'">BACKLOG</a>').insertAfter(".menuitem.supernav.username");

    // Initialize Chrome Storage
    initChromeLocal();

}


//+-------------------------------------------------------
//| initChromeLocal()
//+--------------------------------
//| + gets chrome.local information when needed
//| + Sets global db and user vars
//+-------------------------------------------------------
function initChromeLocal(storage)
{

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

    // Initialize user data update
    // -> module.user
    GetPlayerSummaries();

    // Notify the user about a new extension update
    if(parseFloat(v) > parseFloat(settings.v)){

        var options = {
            notID: "update-alert",
            title: "Steam Backlog",
            message: "Has been updated to version "+ v,
            contextMessage: "Click here to see what's new",
        };

        chrome.runtime.sendMessage({push: options}, function(response){
            //console.log("...");
        });
    }
}
