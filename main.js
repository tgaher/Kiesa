//swapped the js files with name still intact


<<<<<<< HEAD
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
=======
Parse.Cloud.define( "EndPlayerSessionStartedEvent", function(request, response){

       var EndPlayer = Parse.Object.extend("EndPlayer");
        var meid;
        meid=request.params._meid;
        query = new Parse.Query("EndPlayer");
        query.equalTo("MEID",meid );
        query.find({
          success: function(results)
          {
            if ( results.length == 0 )
            {
              // new meid, add to db
              var endPlayer= new EndPlayer();
              endPlayer.set("MEID",meid1+i.toString());
              endPlayer.save(null,{
                success: function(object) {}
              });
              response.success({"response":"new meid"});
            }
            else if ( results.length == 1)
            {
              //mewid already present
                response.success({"response":"meid already present"});
            }
          },
          error: function( error){
            response.error({"response":"some error occured"});
          }
        });
>>>>>>> origin/OriginalQuery
      });
