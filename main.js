//swapped the js files with name still intact


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
             if ( results.length == 1 )
             {
                 endPlayerObjectId = results[0].id;
                 response.success({"response": endPlayerObjectId });
             }
             else{
                response.success({"response": "no nigga"});
                }
           },
           error: function( error){
             response.error({"response":"some error occured"});
           }
         });
      });
