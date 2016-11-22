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

function setAppMargin(){
  clearTimeout(resize);
  resize = window.setTimeout(function(){
    var contentWidth = (contentWidth)? contentWidth : $( ".content" ).width() - 15;
    var appWidth     = (appWidth)? appWidth : $( ".game-card:first-child" ).outerWidth(true);

    var rest    = contentWidth / appWidth;
    var numApps = Math.floor(rest);
    var margin  = (rest - numApps) * appWidth;
    var marginRight = (margin / numApps) + 10;

    if($("#css-app-margin").length){
      $("#css-app-margin").html(".game-card{ transition: margin-right 0.3s; margin-right: " + marginRight + "px !important; }"); }

  }, 600);

}

$(document).ready(function(){

  setAppMargin();
  $( window ).resize(function() { setAppMargin(); });

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
  });

});
