* Cannot use storage.sync for db because max size for item is 8KB. Our JSON is 2MB
* Cannot use howlongtobeat because they don't allow x-origin requests
* Cannot print currently playing on profile because we don't have a server.

/*
else get user data and set it on localstorage - warning if private -
check if user profile is owner
---
get played games in last two weeks
if one game has > 5h and is not in currently playing games -> show message
message options: yes, add it to currently playing games / nope, just idling for cards.
*/