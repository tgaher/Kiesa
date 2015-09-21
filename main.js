
Parse.Cloud.define( "PrintThis", function(request, response){

	// ================================
	// NOT WORKING YET
	// ================================
	/*
		var GameScore = Parse.Object.extend("GameScore");
		console.log("test1");
		var query = new Parse.Query("GameScore");
		query.equalTo("playerName", "Sean Plott" );
		query.count({
	  success: function(number) {
	    response.success(number);
	  },
	  error: function(error) {
			response.error("bitches");
	  }
 });
 */

	// ================================
	// WORKING EXAMPLE 1
	// ================================
	/*
 	response.success({
		"reply" : request.params._message
	});
	*/

	// ================================
	// WORKING EXAMPLE 2
	// ================================
	/*
	var sum = request.params._ele1 + 		request.params._ele2;
	response.success({
		"sum" : sum
	});
	*/
	
	// ====
        var GameScore = Parse.Object.extend("GameScore");
        console.log("test1");
        var query = new Parse.Query("GameScore");
        query.equalTo("playerName", "Sean Plott");
        query.count({
        success: function(number) {
          response.success(
            { "_numberOfSeans":number }
          );
        },
	error: function(error) {
          response.error(
            { "reply":"bitches" }
          );
      	}
});
