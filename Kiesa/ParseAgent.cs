using UnityEngine;
using System.Collections;
using System.Threading.Tasks;
using Parse;
using System.Collections.Generic;

public class ParseAgent : MonoBehaviour {

	void Start(){

		// ================================
		// WORKING EXAMPLE 1
		// ================================
		/*
		IDictionary<string, object> args = new Dictionary<string, object>{
			{ "_message", "hello world"}
		};

		ParseCloud.CallFunctionAsync<IDictionary<string, object>>("PrintThis", args).ContinueWith(t => {
				IDictionary<string, object> result = t.Result;
				object code;
				if(result.TryGetValue("reply", out code)){
					Debug.Log("Reply : " + result["reply"]);
				}

		});
		*/

		// ================================
		// WORKING EXAMPLE 2
		// ================================
		IDictionary<string, object> args = new Dictionary<string, object>{

			{ "_ele1", 5},
			{ "_ele2", 10}
		};

		ParseCloud.CallFunctionAsync<IDictionary<string, object>>("PrintThis", args)
		.ContinueWith(t =>{

			IDictionary<string, object> result = t.Result;
			object code;
			if(result.TryGetValue("sum", out code)){
				Debug.Log(result["sum"]);
			}
		});
	}
}
