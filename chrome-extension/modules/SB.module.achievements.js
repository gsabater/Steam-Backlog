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
//| getAppAchievements()
//| +
//+-------------------------------------------------------
function getAppAchievements(){


/*
    // if game has no achievements, close and set
    if(db[appID].wishlist || !app.achievements || (app.achievements === false) || (app.achievements === 0)){
        howLongToBeatSteam(appID);
        saveGameInfo(appID);
        return;
    }

    // 2. Get achievements stats
    // every user must do it on it's own
    $.getJSON("http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=" + appID + "&key=A594C3C2BBC8B18CB7C00CB560BA1409&steamid=" + user.steamid,
    function(data){
    })
    .always(function(data){

        // Achievements info if it has
        if(data.hasOwnProperty("playerstats")){
            if(data.playerstats.hasOwnProperty("achievements")){
                var achieved = 0; for(var i in data.playerstats.achievements){
                    if(data.playerstats.achievements[i].achieved == 1){ achieved++; } }

                db[appID].achievements = data.playerstats.achievements.length;
                db[appID].achieved     = achieved;

            }
        }

        howLongToBeatSteam(appID);
        saveGameInfo(appID);

    });
*/

}
