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


/*
  {

          name: e.name,
          cached: n,
          updated: null,
          released: null,

          playtime_forever: e.playtime_forever,
          achievements: null,
          achieved: null,

          metascore: null,
          userscore: null,
          steamscore: null,
          tags: null,
          controller: null,

          hltb: {
            main: null,
            extras: null,
            completionist: null
          },

          categories: {
            singlePlayer: null,
            multiPlayer: null,
            mmo: null,
            coop: null,
            localCoop: null
          },

          status: {
            playing: false,
            loved: false,
            completed: false,
            mastered: false,
            dominated: false,
            shelved: false
          },

          notes: ""

        }
        */