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