// ================================
// WHEN A GAME SESSION STARTS
// ================================
// Receiving paramenters:
// _meid :  the meid code of the device
// _ambitGameKey: The game key given to the developer
Parse.Cloud.define("EndPlayerSessionStartedEvent", function(request, response){
 
    var EndPlayer = Parse.Object.extend("EndPlayer");
    var PlayerGames = Parse.Object.extend("PlayerGames");
     
    var meid = request.params._meid;
    var ambitGameKey = request.params._ambitGameKey;
 
    hasThisPlayerBeenProfiledYet = new Parse.Query(EndPlayer);
     
    hasThisPlayerBeenProfiledYet.equalTo("MEID", meid);
    hasThisPlayerBeenProfiledYet.find().then(
     
        function(hasThisPlayerBeenProfiledYetResult){
             
            // IF THIS PLAYER HAS NOT BEEN PROFILED YET
            if(hasThisPlayerBeenProfiledYetResult.length == 0){
                 
                // CREATE A NOW ROW FOR THE ENDPLAYER TABLE
                // And set values into it
                var newEndPlayer= new EndPlayer();
                newEndPlayer.set("MEID", meid);
                newEndPlayer.set("discovered_by_game", ambitGameKey);
                newEndPlayer.set("ratio", 0);
                 
                return newEndPlayer.save().then(
                 
                    function(newEndPlayerSaved){
                         
                        // If player hasn't been profiled yet,
                        // it also would not have a relationship
                        // with this game in PlayerGames table
                        // So we create a row for that
                 
                        var newPlayerGames = new PlayerGames();
                        newPlayerGames.set("MEID", meid);
                        newPlayerGames.set("ref_games", ambitGameKey);
                        newPlayerGames.set("sessions_played", 1);
                        newPlayerGames.set("total_time_played", 0);
                        newPlayerGames.set("avg_session_length", 0);
                         
                        newPlayerGames.set("videos_started_auto", 0);
                        newPlayerGames.set("videos_started_deliberately", 0);
                        newPlayerGames.set("videos_started_on_prompt", 0);
                         
                        newPlayerGames.set("videos_finished_auto", 0);
                        newPlayerGames.set("videos_finished_deliberately", 0);
                        newPlayerGames.set("videos_finished_on_prompt", 0);
                         
                        return newPlayerGames.save().then(
                            function(object){
                                response.success({"response": "NEW_END_PLAYER_ADDED"});
                            }
                        );
                    }
                )
            }
            else if(hasThisPlayerBeenProfiledYetResult.length > 0){
         
                // IF THIS PLAYER HAS BEEN PROFILED YET
                // There is a chance that the player is playing a new game
                // So we check that
                hasPlayerPlayedThisGameBefore = new Parse.Query(PlayerGames);
                hasPlayerPlayedThisGameBefore.equalTo("MEID", meid);
                hasPlayerPlayedThisGameBefore.equalTo("ref_games", ambitGameKey);
                return hasPlayerPlayedThisGameBefore.find().then(
                 
                    function(hasPlayerPlayedThisGameBeforeResult){
 
                        // IF THE PLAYER HAS NEVER PLAYED THIS GAME BEFORE
                        if (hasPlayerPlayedThisGameBeforeResult.length == 0 ){
 
                            // CREATE A NEW ROW IN THE PLAYERGAMES TABLE ALSO
                            // And set default values into it
                            var playerGames = new PlayerGames();
                            playerGames.set("MEID", meid);
                            playerGames.set("ref_games", ambitGameKey);
                            playerGames.set("sessions_played", 1);
                            playerGames.set("total_time_played", 0);
                            playerGames.set("avg_session_length", 0);
                             
                            playerGames.set("videos_started_auto", 0);
                            playerGames.set("videos_started_deliberately", 0);
                            playerGames.set("videos_started_on_prompt", 0);
                             
                            playerGames.set("videos_finished_auto", 0);
                            playerGames.set("videos_finished_deliberately", 0);
                            playerGames.set("videos_finished_on_prompt", 0);
 
                            // first save the EndPlayer table row
                            return playerGames.save().then(
                                function(object){
                                    response.success({"response": "END_PLAYER_PLAYING_NEW_GAME"});
                                }
                            );
                        }
                        // IF THE PLAYER HAS PLAYED THIS GAME BEFORE
                        else if (hasPlayerPlayedThisGameBeforeResult.length > 0){
 
                            // Then we increment the session count
                            hasPlayerPlayedThisGameBeforeResult[0].set(
                                "sessions_played",
                                hasPlayerPlayedThisGameBeforeResult[0].get("sessions_played") + 1
                            );
                             
                            // Then save it
                            return hasPlayerPlayedThisGameBeforeResult[0].save().then(
                                function(sessionsIncremented){
                                    response.success({
                                        "response": "END_PLAYER_PLAYING_A_GAME_AGAIN"
                                    });
                                }
                            );
                        }
                    }
                );
            }
        }
    );
    // Query ends
});
 
// ================================
// WHEN A VIDEO STARTS SHOWING
// ================================
// Parameters received:
// _meid: the meid code of the device
// _ambitGameKey: the game key
// _videoType: an enum varying between "auto", "deliberate", "onPrompt"
// _videoStatus: "started", "finished"
Parse.Cloud.define( "VideoEvent", function(request, response){
 
    // We get classes from the tables
    var PlayerGames = Parse.Object.extend("PlayerGames");
     
    // meid as received in the request
    var meid = request.params._meid;
    var videoType = request.params._videoType;
    var ambitGameKey = request.params._ambitGameKey;
    var videoStatus = request.params._videoStatus;
     
    meidInPlayerGames = new Parse.Query("PlayerGames");
 
    // *** WE GET ALL THE GAMES PLAYED BY THIS END PLAYER ***
    meidInPlayerGames.equalTo("MEID", meid);
    meidInPlayerGames.find().then(                          //this is where im changing it
 
        function(endPlayerGamesSearchResults){
 
            // IF THE METHOD HAS BEEN CALLED FOR VIDEO STARTED      
            if(videoStatus == "started"){
                 
                // If the player had never been profiled before,
                // his entry will not be found :
                if (endPlayerGamesSearchResults.length == 0){
                 
                    var playerGames = new PlayerGames();
                    playerGames.set("MEID", meid);
                    playerGames.set("ref_games", ambitGameKey);
                    playerGames.set("sessions_played", 1);
                    playerGames.set("total_time_played", 0);
                    playerGames.set("avg_session_length", 0);
                     
                    playerGames.set("videos_finished_auto", 0);
                    playerGames.set("videos_finished_deliberately", 0);
                    playerGames.set("videos_finished_on_prompt", 0);
                     
                    // Set the appropriate video type to 1 for the new row
                    switch(videoType){
                         
                        case "auto":
                            playerGames.set("videos_started_auto", 1);
                            break;
                        case "deliberate":
                            playerGames.set("videos_started_deliberately", 1);
                            break;
                        case "onPrompt":
                            playerGames.set("videos_started_on_prompt", 1);
                            break;
                        default:
                            break;
                    }
                    // Save the row in the table
                    return playerGames.save().then(
                        function(object){
                            response.success({"response": "SUCCESS_VIDEO_STARTED"});
                        }
                    );
                }
                else if(endPlayerGamesSearchResults.length > 0){
                     
                    // We will get atleast one game so we loop through them all
                    for(var j = 0; j < endPlayerGamesSearchResults.length; j++){
 
                        // If this is the current game
                        if(endPlayerGamesSearchResults[j].get("ref_games") == ambitGameKey){
                             
                            // We get the current videos started based on _videoType
                            var videosStartedCount = 0;
 
                            if(videoType == "auto"){
                                videosStartedCount = endPlayerGamesSearchResults[j].get("videos_started_auto");
                                videosStartedCount++;
                                endPlayerGamesSearchResults[j].set("videos_started_auto", videosStartedCount);
                            }
                            else if(videoType == "deliberate"){
                                videosStartedCount = endPlayerGamesSearchResults[j].get("videos_started_deliberately");
                                videosStartedCount++;
                                endPlayerGamesSearchResults[j].set("videos_started_deliberately", videosStartedCount);
                            }
                            else{
                                videosStartedCount = endPlayerGamesSearchResults[j].get("videos_started_on_prompt");
                                videosStartedCount++;
                                endPlayerGamesSearchResults[j].set("videos_started_on_prompt", videosStartedCount);
                            }
 
                            return endPlayerGamesSearchResults[j].save().then(
                                function(object){
                                    response.success({"response": "SUCCESS_VIDEO_STARTED"});
                                }
                            );
                            // SAVE BLOCK ENDS
                        }
                    }
                }
            }
            // IF THE METHOD HAS BEEN INVOKED FOR VIDEO FINISHED            
            else{
                 
                for(var j = 0; j < endPlayerGamesSearchResults.length; j++){
 
                    // If this is the current game
                    if(endPlayerGamesSearchResults[j].get("ref_games") == ambitGameKey){
 
                        // We get the current videos started based on _videoType
                        var videosStartedCount = 0;
 
                        if(videoType == "auto"){
                            videosStartedCount = endPlayerGamesSearchResults[j].get("videos_finished_auto");
                            videosStartedCount++;
                            endPlayerGamesSearchResults[j].set("videos_finished_auto", videosStartedCount);
                        }
                        else if(videoType == "deliberate"){
                            videosStartedCount = endPlayerGamesSearchResults[j].get("videos_finished_deliberately");
                            videosStartedCount++;
                            endPlayerGamesSearchResults[j].set("videos_finished_deliberately", videosStartedCount);
                        }
                        else{
                            videosStartedCount = endPlayerGamesSearchResults[j].get("videos_finished_on_prompt");
                            videosStartedCount++;
                            endPlayerGamesSearchResults[j].set("videos_finished_on_prompt", videosStartedCount);
                        }
 
                        return endPlayerGamesSearchResults[j].save().then(
                            function(object){
                                response.success({"response": "SUCCESS_VIDEO_FINISHED"});
                            }
                        );
                        // SAVE BLOCK ENDS
                    }
                }
                 
            }
        }
    );
    // Query ends
});
