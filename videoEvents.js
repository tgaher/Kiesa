        Parse.Cloud.define( "VideoStartedOnPromptEvent", function(request, response){
               var PlayerGames = Parse.Object.extend("PlayerGames");
               var EndPlayer = Parse.Object.extend("EndPlayer");
               var meid;
               meid=request.params._meid;
               meidToPrimaryKey = new Parse.Query("EndPlayer");
               meidToPrimaryKey.equalTo("MEID",meid );
               var endPlayerObjectId= 0;
               meidToPrimaryKey.find({
                 success: function(results)
                 {
                   if ( results.length == 1 ){
                       endPlayerObjectId = results[0].id;
                       meidInPlayerGames = new Parse.Query("PlayerGames");               //to save tuples of matching ptr_endplayer
                       meidInPlayerGames.equalTo("ptr_endplayer",endPlayerObjectId);
                       meidInPlayerGames.find({
                          success: function(results){
                            for(var j=0; j<results.length ; j++){
                              // if(results[j].get("ptr_games")==request.params._ambitGameId) "comparing the gameID....this comes later"
                              var vsop = result.get("videos_started_on_prompt");
                              vsop++;
                              PlayerGames.set("videos_started_on_prompt",vsop);
                              PlayerGames.save(null,{
                                success: function(object) {}
                              });
                            }
                            response.success({"response": "done, i think" });
                          }

                        }
                      }
                   else{
                      response.success({"response": "no nigga"});
                      }
                 },
                 error: function( error){
                   response.error({"response":"some error occured"});
                 }
               });  //query.find function

             });
