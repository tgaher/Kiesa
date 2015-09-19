using System.Collections;
using UnityEngine;
using System.Threading.Tasks;
using Parse;

public class ParseTest {
	public void Test(){
				ParseObject gameScore = new ParseObject ("GameScore");
				gameScore ["LT_Score"] = 1337;
				gameScore ["Name"] = "Sean Plott";
				Task saveTask = gameScore.SaveAsync ();
		}

}
