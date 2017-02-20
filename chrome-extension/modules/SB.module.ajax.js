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

//+-------------------------------------------------------
//| updateDB()
//+-------------------------------------------------------
function updateDB()
{
    var d = new Date();
    var n = d.getTime();

    // 1. stop execution if the user don't have any games in localstorage
    if(!db || Object.keys(db).length === 0){
        console.warn("Steam Backlog -> updateDB: db is empty. Stopping updateDB()");
        return; }

    //1.5 if process has been flagged as ended
    if(isQueue){
        hideDialog("loader");
        console.warn("Steam Backlog -> updateDB: db queue is completed. Stopping updateDB()"); return; }

    // 2. If there is no queue, build one with
    // db games and wishlist games
    if(queue.length === 0){

        for(var i in db){
            g = db[i];

            if(!g.updated || (n - g.updated) > config.updateAppAfter ){
                queue.push([g.appid, g.playtime_forever]);
            }
        }

        queue.sort(function(a, b){ return b[1] - a[1]; });
    }

    // 3. Process queue with getgameinfo or mark queue as completed
    if(queue.length > 0){
        getGameInfo();
        timeout = false;
        console.log("Queue remaining", queue.length, queue);
    }else{
        isQueue = true;
        console.log("Steam Backlog -> updateDB: queue flagged as finished");
    }
}


//+-------------------------------------------------------
//| getGameInfo()
//| + Process queue to update app data
//+-------------------------------------------------------
function getGameInfo(injectID)
{
    //console.warn(injectID, queue);

    //| 1. Add games to queue if injectID is set
    //+-------------------------------------------------------
    if(injectID){

        if(typeof injectID == "number"){ queue.unshift(injectID); }
        if(typeof injectID == "string"){ queue.unshift(injectID); }
        if(Array.isArray(injectID)){ queue.unshift(injectID[0]); }

        getGameInfo();
        return;
    }

    // 2. Segment the queue in little batches of 50 games each
    // the batch is sent to steam-backlog.com and returned data
    //+-------------------------------------------------------
    if(queue.length > 1){
        var segment = queue.slice(0, config.batchSize);
        scrapBatch(segment, segment[0]);

        if(queue.length > 15){
            percent = (100-(queue.length * 100) / Object.keys(db).length);
            showDialog("Your library is being updated, please wait... <br>" + percent.toFixed(1) +"%", "loader", percent);
        }

    }else{
        var gameID = queue[0];
        gameID = (Array.isArray(gameID))? gameID[0] : gameID;
        scrapApp(gameID);
    }

}


//+-------------------------------------------------------
//| scrapApp()
//| +
//+-------------------------------------------------------
function scrapApp(gameID){

    console.log("%c Steam Backlog: Scrap Game -> " + gameID + " ( " + db[gameID].name + " ) ", 'background: #222; color: #bada55');

    //| 1.
    //+-------------------------------------------------------
    $.getJSON("https://steam-backlog.com/api/get/" + gameID,
    function(data){
        mergeApp(data);
    });

}


//+-------------------------------------------------------
//| scrapBatch()
//| +
//+-------------------------------------------------------
function scrapBatch(batch){

    console.log("%c Steam Backlog: Scrap Batch ", 'background: #222; color: #bada55', batch);

    //| 1.
    //+-------------------------------------------------------
    $.post("https://steam-backlog.com/api/batch", { appids: batch })
    .done(function(data){
        data = JSON.parse(data);
        console.log(data, data.length);

        for(i in data){
            g = data[i];
            mergeApp(g);
        }

        if(data.length == 0){
            queue = [];
            isQueue = true;
            saveGameInfo();

            if(isAngular){
                if($("div[ng-view]").scope().hasOwnProperty("jQueryCallback")){
                    $("div[ng-view]").scope().queue = [];
                    $("div[ng-view]").scope().jQueryCallback();
                }
            }
        }
    });

}


//+-------------------------------------------------------
//| mergeApp()
//| +
//+-------------------------------------------------------
function mergeApp(app){

    if(!app.hasOwnProperty('appid')){
        console.log("%c Steam Backlog: Corrupted app ", 'background: #222; color: #bada55', app);
        return;
    }

    var d = new Date();
    var n = d.getTime();

    var appID = app.appid.toString();

    // Merge received data into existing db object
    $.extend(db[appID], app);

    // Fix normalization, appid always must be a string
    db[appID].appid = db[appID].appid.toString();

    // Store local updated Date
    db[appID].updated = n;

    howLongToBeatSteam();
    saveGameInfo(appID);
}


//+-------------------------------------------------------
//| howLongToBeatSteam()
//| + Loads user information from howlongtobeatsteam
//| + Fills information for a certain or all games
//+-------------------------------------------------------
function howLongToBeatSteam(){

    //| Get howlongtobeatsteam info
    //| And call function again
    //+-------------------------------------------------------
    if(hltbs === false){

        hltbs = true;

        $.getJSON("https://www.howlongtobeatsteam.com/api/games/library/" + user.steamid + "?callback=jsonp", function(hltbs){
        }).always(function(xhr){
            hltbs = xhr;
            howLongToBeatSteam();
        });

        return;
    }

    //| For every game into howlongtobeatsteam
    //| insert data on db
    //+-------------------------------------------------------
    for(var i in hltbs.Games){
        game = hltbs.Games[i].SteamAppData;
        //console.log(game.SteamAppId, game);

        //if((gameID !== "all") && (game.SteamAppId !== gameID)){ continue; }
        if(db[game.SteamAppId]){ db[game.SteamAppId].hltb = game.HltbInfo; }
        //if((gameID !== "all") && (game.SteamAppId == gameID)){ break; }
    }

    //| Mark missing games from HLTBS in db to avoid calling again
    //+-------------------------------------------------------
    //if(gameID == "all"){
        for(i in db){
            game = db[i];
            if(!game.hasOwnProperty("hltb")){ db[i].hltb = "unavailable"; } }
    //}

    //| Save totals and db objects in chrome.local
    //+-------------------------------------------------------
    user.hltbs = hltbs.Totals;
    //chrome.storage.local.set({'user': user}, function(){ /* console.warn("user saved", user); */ });
    //chrome.storage.local.set({'db': db}, function(){ /* console.warn("db saved", db); */ });
    if(isAngular){ if($("div[ng-view]").scope().hasOwnProperty("jQueryCallback")){ $("div[ng-view]").scope().jQueryCallback(); } }

}


//+-------------------------------------------------------
//| saveGameInfo()
//| +
//+-------------------------------------------------------
function saveGameInfo(gameID){

    // 1. Remove the game from the queue
    for(var i in queue){

        _queueID = queue[i];
        _queueID = (Array.isArray(_queueID))? _queueID[0] : _queueID;

        if(_queueID == gameID){
            queue.splice(i, 1);
            //console.log("Removing " + gameID + " (" + db[gameID].name + ") from queue ("+ i +")");
            break;
        }

    }

    // 2. Inform angular about the update
    // and refresh scope
    if(isAngular){
        if($("div[ng-view]").scope().hasOwnProperty("jQueryCallback")){
            $("div[ng-view]").scope().jQueryCallback();
            var $card = document.getElementById('SB-game-card');
            if($card){ $($card).scope().updateGameDetails(); }
        }
    }

    // 3. Create a stopwatch to start again with settings interval
    //var time = settings.scan.interval; //console.log(time,"s", timeout, "angular: " + isAngular);
    var time = 3;
    if(!timeout){ timeout = window.setTimeout(function(){ updateDB(); }, time * 1000); }
    if(savedb == false){
        savedb = true;
        window.setTimeout(function(){
            savedb = false;
            chrome.storage.local.set({'db': db}, function(){ console.log("db saved"); });
        }, 5000);
    }
}
