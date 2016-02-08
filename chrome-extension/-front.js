//=================================================================
//                                                          
//   
//=================================================================

console.warn("Steam Backlog active");

init();

var userID = false;

  //+-------------------------------------------------------
  //| init()
  //+--------------------------------
  //| + Checks if any notification is on the button and append
  //| + Also inits localstorage *
  //+-------------------------------------------------------
    function init(){
      //console.log($("body"));
      $('<a class="menuitem" href="https://help.steampowered.com/">BACKLOG</a>').insertAfter(".menuitem.supernav.username");
    }