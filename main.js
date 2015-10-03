// ================================
// WHEN A GAME SESSION STARTS
// ================================
// Receiving paramenters:
// _meid :  the meid code of the device
// _ambitGameKey: The game key given to the developer
// _ambitDeveloperKey: The developer key given to the developer
Parse.Cloud.define("EndPlayerSessionStartedEvent", function(request, response){

	var EndPlayer = Parse.Object.extend("EndPlayer");
	var PlayerGames = Parse.Object.extend("PlayerGames");
	
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

				// CREATE A NOW ROW FOR THE ENDPLAYER TABLE
				// And set values into it
				var endPlayer= new EndPlayer();
				endPlayer.set("MEID", meid);
				endPlayer.set("discovered_by_game", ambitGameKey);
				endPlayer.set("ratio", 0);

				// Save the row in the table
				endPlayer.save(null,{
					success: function(object) {}
				});
				
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
				
				// Save the row in the table
				playerGames.save(null,{
					success: function(object){}
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
	meidInPlayerGames.find({

		success: function(endPlayerGamesSearchResults){
			
			if(videoStatus == "started"){
				// IF THE METHOD HAS BEEN CALLED FOR VIDEO STARTED
				
				// If the player had never been profiled before,
				// his entry will not be found :
				// TODO: Shift the responsibility of ensuring a row
				// on to the EndPlayerSessionStartedEvent method
				if (endPlayerGamesSearchResults.length == 0){
					
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
					playerGames.save(null,{
						success: function(object){
							response.success({"response": "SUCCESS_VIDEO_STARTED"});
						}
					});
				}
				else if(videoStatus == "finished"){
					
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

							endPlayerGamesSearchResults[j].save(null,{
								success: function(object){
									response.success({"response": "SUCCESS_VIDEO_STARTED"});
								}
							});
							// SAVE BLOCK ENDS
						}
					}
				}
			}
			else{
				// IF THE METHOD HAS BEEN INVOKED FOR VIDEO FINISHED
				
				for(var j = 0; j < endPlayerGamesSearchResults.length; j++){

					// If this is the current game
					if(endPlayerGamesSearchResults[j].get("ref_games") == ambitGameKey){

						// We get the current videos started based on _videoType
						var videosStartedCount = 0;

						if(videoType == "auto"){
							videosStartedCount = endPlayerGamesSearchResults[j].get("videos_finished_auto");
							videosStartedCount++;
							endPlayerGamesSearchResults[j].set("videos_started_auto", videosStartedCount);
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

						endPlayerGamesSearchResults[j].save(null,{
							success: function(object){
								response.success({"response": "SUCCESS_VIDEO_FINISHED"});
							}
						});
						// SAVE BLOCK ENDS
					}
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
	// Query ends
});
