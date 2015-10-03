// ================================
// WHEN A GAME SESSION STARTS
// ================================
// Receiving paramenters:
// _meid :  the meid code of the device
// _ambitGameKey: The game key given to the developer
// _ambitDeveloperKey: The developer key given to the developer
 
Parse.Cloud.define("EndPlayerSessionStartedEvent", function(request, response){
     
    var EndPlayer = Parse.Object.extend("EndPlayer");
    var meid = request.params._meid;
    var ambitGameKey = request.params._ambitGameKey;
 
    // Create a query on the EndPlayer table
    query = new Parse.Query("EndPlayer");
 
    // Check for all rows where the MEID value is equal to meid received
    query.equalTo("MEID",meid );
    query.find({
 
        // If the query was successful
        success: function(results){
 
            // If the player had never been profiled before,
            // his entry will not be found :
            if (results.length == 0 ){
 
                // Create a now row for the EndPlayer table
                // And set values into it
                var endPlayer= new EndPlayer();
                endPlayer.set("MEID", meid);
                endPlayer.set("discovered_by_game", ambitGameKey);
                endPlayer.set("ratio", 0);
 
                // Save the row in the table
                endPlayer.save(null,{
                    success: function(object) {}
                });
                response.success({"response": "NEW_END_PLAYER_ADDED"});
            }
            // Else the player already exists in the table
            else if ( results.length == 1){
 
                var ratio = results[0].get("ratio");
                response.success({
                    "response": "END_PLAYER_FOUND"
                });
            }
        },
        // If there was an error running the query
        error: function( error){
            response.error({
                "response": "ERROR",
                "code" : error.message
            });
        }
    });
    // Query ends
});
 
 
// ================================
// WHEN A VIDEO STARTS SHOWING
// ================================
// Parameters received:
// _meid: the meid code of the device
// _ambitGameKey: the game key
// _videoType: an enum varying between "auto", "deliberate", "onPrompt"
Parse.Cloud.define( "VideoStartedEvent", function(request, response){
 
 
    // We get classes from the tables
    var PlayerGames = Parse.Object.extend("PlayerGames");
    var EndPlayer = Parse.Object.extend("EndPlayer");
 
    // meid as received in the request
    var meid = request.params._meid;
    var videoType = request.params._videoType;
    var ambitGameKey = request.params._ambitGameKey;
     
     
    // *** WE LOOK FOR THE CORRESPONDING PRIMARY KEY OF THE MEID RECEIVED IN THE ENDPLAYER TABLE ***
    meidToPrimaryKey = new Parse.Query("EndPlayer");
    meidToPrimaryKey.equalTo("MEID", meid);
 
    meidToPrimaryKey.find({
 
        success: function(meidSearchResults){
 
            // If the device invoking the method has already been profiled into the EndPlayer table before
            if (meidSearchResults.length == 1 ){
 
                // We get the primary key, ie. the objectId of the first and only result and use it next
                var endPlayerObjectId = meidSearchResults[0].id;
                meidInPlayerGames = new Parse.Query("PlayerGames");
 
                // *** WE GET ALL THE GAMES PLAYED BY THIS END PLAYER ***
                meidInPlayerGames.equalTo("ref_endplayer", endPlayerObjectId);
                meidInPlayerGames.find({
 
                    success: function(endPlayerGamesSearchResults){
                         
                        // We will get atleast one game so we loop through them all             
                        for(var j = 0; j < endPlayerGamesSearchResults.length; j++){
                             
                            // If this is the current game
                            if(endPlayerGamesSearchResults[j].get("ref_games") == ambitGameKey){
                                 
                                // We get the current videos started based on _videoType
                                var videosStartedCount = 0;
                                 
                                if(videoType == "auto")
                                    videosStartedCount = endPlayerGamesSearchResults[j].get("videos_started_auto");
                                else if(videoType == "deliberate")
                                    videosStartedCount = endPlayerGamesSearchResults[j].get("videos_started_deliberately");
                                else
                                    videosStartedCount = endPlayerGamesSearchResults[j].get("videos_started_on_prompt");
                             
                                // on prompt count, increment it, set it and save it
                                videosStartedCount++;
 
                                if(videoType == "auto")
                                    endPlayerGamesSearchResults[j].set("videos_started_auto", videosStartedCount);
                                else if(videoType == "deliberate")
                                    endPlayerGamesSearchResults[j].set("videos_started_deliberately", videosStartedCount);
                                else
                                    endPlayerGamesSearchResults[j].set("videos_started_on_prompt", videosStartedCount);
                                 
                                 
                                endPlayerGamesSearchResults[j].save(null,{
                                    success: function(object){
                                        response.success({"response": "SUCCESS_VIDEO_STARTED"});
                                    }                                   
                                });
                                // SAVE BLOCK ENDS
                            }
                        }
                    },
                    // success block ends
                    error: function(error){
                        response.error({
                            "response":"ERROR_COULD_NOT_QUERY",
                            "code": error.message
                        });
                    }
                     
                });
                // Child 1 query ends
            }
            // SHOULD NOT HAPPEN EVERY PLAYER IN EndPlayer HAS ATLEAST ONE GAME, THIS.
            // BUT WE STILL HAVE IT HERE
             
            else{
                response.success(
                    {"response": "ERROR_PLAYER_HAS_NO_GAMES"}
                );
            }
        },
        // Parent success block ends and error follows
        // THIS SHOULD NOT HAPPEN, ANY CLIENT CALLING THIS METHOD
        // IS THEORETICALLY ALWAYS ALREADY REGISTERED IN EndPlayer
        error: function(error){
            response.error({
                "response": "ERROR_COULD_NOT_FIND_MEID",
                "code": error.message
            });
        }
    });
    // Parent query ends
});
