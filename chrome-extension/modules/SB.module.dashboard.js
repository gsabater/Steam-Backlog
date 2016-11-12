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

$(document).ready(function(){

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
