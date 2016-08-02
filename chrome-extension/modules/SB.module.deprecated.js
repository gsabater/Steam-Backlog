//+-------------------------------------------------------
//| detectNewGames()
//| + Gets owned games from all games and profile number.
//+-------------------------------------------------------
  function detectNewGames(){

  //| Get number of owned games
  //| If profile is higher, set a message.
  //+-------------------------------------------------------
    var profileGames  = $(".responsive_count_link_area a[href*='games/?tab=all'] span.profile_count_link_total").text().replace(",", "");
    profileGames      = parseInt(profileGames);
    user.profileGames = (user.profileGames)? user.profileGames : 0;

    //console.warn(user.profileGames, profileGames);

    if(user.profileGames < profileGames){
      var newGames = profileGames - parseInt(user.profileGames);

      var scanPanel = ''
      + '<div id="sb-detected-games" class="profile_customization">'
        + '<a class="profile_customization_editlink" href="http://steamcommunity.com/id/Gohrum/edit#showcases">'
        + '<span class="profile_customization_editlink_text">Disable automatic detection</span></a>'
      + '<div class="profile_customization_header ellipsis">New untracked games</div>'
      + '<div class="profile_customization_block"><div id="sb-detected-games-bar" class="customtext_showcase">'
      + '<div id="sb-detected-games-content" class="showcase_content_bg showcase_notes" style="line-height: 17px;">'
        + '<div id="sb-btn-scan-games" class="btn_profile_action btn_medium" style="float: right; border:none;"><span>Sure</span></div>'
        + 'Looks like you have <span style="color: #bada55;">' + newGames + '</span> new games.<br>'
        + 'Do you want Steam Backlog to track them now?' //<span style="background: #222; color: #bada55;padding: 0 5px;">Steam Backlog</span>
      + '</div></div></div></div>';

      $(".profile_customization_area").prepend(scanPanel);

    }

    // On click, execute doFastScan
  }