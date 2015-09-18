
Parse.Cloud.define( "sPlott", function(request, response){
		var GameScore = Parse.Object.extend("GameScore");
		var query = new Parse.Query("GameScore");
		console.log("test1");
		query.equalTo("playerName", "Sean Plott" );
		query.find({
			success: function(results) {
				console.log("test2");
				var sum=0;
				for (var i = 0; i < results.length; ++i) {
         sum += results[i].get("score");
			}
			response.success(sum);
		},
		error: function(error) {
			response.error("Error has occured");
		}
	});

});
