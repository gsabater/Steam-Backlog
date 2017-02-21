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

var resize       = false;
var contentWidth = false;
var appWidth     = false;

var marginRight  = false;

function setAppMargin(){

    if(marginRight !== false){
        if($("#css-app-margin").length){
            $("#css-app-margin").html(".game-card{ margin: 17px " + marginRight / 2 + "px !important; }"); }
            return;
    }

    clearTimeout(resize);
    resize = window.setTimeout(function(){
        var contentWidth = (contentWidth)? contentWidth : $( ".content" ).width() -40;
        var appWidth     = (appWidth)? appWidth : $( ".game-card:first-child" ).width();

        var rest    = contentWidth / appWidth;
        var numApps = Math.floor(rest);
        var margin  = (rest - numApps) * appWidth;
        marginRight = (margin / numApps);

        if(marginRight < 10){
            margin  = (rest - (numApps-1)) * appWidth;
            marginRight = (margin / numApps);
        }

        //console.log(contentWidth, appWidth, rest, numApps, margin, "margin?: " + marginRight);

        if($("#css-app-margin").length){
            $("#css-app-margin").html(".game-card{ margin: 17px " + marginRight / 2 + "px !important; }"); }

    }, 200);

}

$(document).ready(function(){

    $( window ).resize(function() { marginRight = false; setAppMargin(); });

//+-------------------------------------------------------
//| + Infinite scroll
//+-------------------------------------------------------
    $(".container").scroll(function(){
        //console.log($(".container").scrollTop(), ($(".content").height() - $("body").height() - 150));
        if($(".container").scrollTop() >= ($(".content").height() - $("body").height() - 150)){
            //console.error($(".container").scrollTop(), $(".content").height(), "naw");
            if($("div[ng-view]").scope().hasOwnProperty("loadMore")){
                $("div[ng-view]").scope().loadMore();
            }
        }
    });


//+-------------------------------------------------------
//| + Close backdrop and additional windows
//+-------------------------------------------------------
    $("#SB-backdrop").on("click", function(){
        //console.log($("div[ng-view]").scope());
        $("div[ng-view]").scope().showTags = false;
        $("div[ng-view]").scope().showGameCard = false;
        $("div[ng-view]").scope().$apply();
        $("div#SB-collection").scope().closePanel(true);
    });

});


function showDialog(text, loader, percent)
{
    window.setTimeout(function(){
        $("div[ng-view]").scope().$parent.app.dialog = text;
        $("div[ng-view]").scope().$parent.app.backdrop = true;
        $("div[ng-view]").scope().$apply();

        if(loader == "loader"){
            if(NProgress.status == null){
                NProgress.configure({
                    parent: '#SB-dialog',
                    showSpinner: false,
                    trickleSpeed: 600
                });
                NProgress.start();
            }else{
                console.log(percent / 100);
                NProgress.set(percent / 100);
            }
        }
    }, 500);

}

function hideDialog(loader)
{
    if(loader == "loader"){
        NProgress.done();
    }

    if($("div[ng-view]").scope().$parent.app.dialog === false){ return; }

    window.setTimeout(function(){
        $("div[ng-view]").scope().$parent.app.dialog = false;
        $("div[ng-view]").scope().$parent.app.backdrop = false;
        $("div[ng-view]").scope().$apply();
    }, 1000);
}
