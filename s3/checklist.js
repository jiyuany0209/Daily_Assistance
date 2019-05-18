var date = "";

//var user_id = "ih8i1u8x9prbt79xr7pjj3stqx4tmrp9";

var url = window.location.href;
var k = url.match(/id_token=(.*)&access/);
var id_token = k[1];

var user_id = id_token.slice(-99);

var params = {
  IdentityPoolId: "us-east-1:15d7145f-e1eb-4561-a1cb-232eab8cdc02",
  Logins: {
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_PVcCCa9S3': id_token
        }
};


function newEntry() {
  if (document.getElementById("inputdate").value != "") {
    date = document.getElementById("inputdate").value;
    console.log("date:"+date)
    document.getElementById("inputdate").value = "";

    AWS.config.region = 'us-east-1';
  	var newcog = new AWS.CognitoIdentity()

  	newcog.getId(params, function(err, data){

  		if (err) {
  			console.log(err)
  		}
  		else {
  			var iden_id = data['IdentityId']
  		}

  		console.log(iden_id);

  		var new_params = {
  			IdentityId: iden_id,
      		Logins: {
        		'cognito-idp.us-east-1.amazonaws.com/us-east-1_PVcCCa9S3': id_token
      		}
  		};


  		newcog.getCredentialsForIdentity(new_params, function(err, data){
  			if (err) {
  				console.log(err)
  			}
  			else {
  				var thiscredential = data['Credentials'];
        		console.log(thiscredential);
        		console.log(thiscredential.AccessKeyId);
        		console.log(thiscredential.SecretKey);
        		console.log(thiscredential.SessionToken);

        		var apigClient = apigClientFactory.newClient({

        			accessKey: thiscredential.AccessKeyId,
          			secretKey: thiscredential.SecretKey,
          			sessionToken: thiscredential.SessionToken,
          			region: 'us-east-1'
        		});

        		var params = {
        			"user_id": user_id,
    				"d": date
        		};

        		var body = {};

        		apigClient.checklistsGet(params, body, {})
        			.then(function(result){
        				var results = result.data.results
        				console.log(results);
        				show(results);

        			});


  			}
  		});
  	});
    
    
    };
};


function show(res) {
	var test = document.getElementById('div');
  var childs=test.childNodes;  
  for(var i=childs.length-1;i>=0;i--)
  {  
  test.removeChild(childs.item(i));    
  } 

    if (res.length==0) {
    	var newDiv = document.createTextNode("No checklist to display for the searching date");
    	var test = document.getElementById('div')
		test.appendChild(newDiv);
		test.setAttribute("style","color:red;font-weight:bold;font-size:30px;padding-top:40px");


    } else {
    	
    	for(var i=0;i<res.length;i++) {
    		var newDiv = document.createElement('p');
			newDiv.date = res[i].date;
			newDiv.time = res[i].time;
			newDiv.name = res[i].what;
	
			newDiv.id = 'rec'+i;
	
			newDiv.user_id = user_id;
	
			var newContent1 = document.createElement("BUTTON");
			newContent1.innerHTML = newDiv.date;


			newContent1.style.paddingTop ="15px";
			newContent1.style.paddingBottom ="25px";
			newContent1.style.height="20px";
			newContent1.style.width="120px";
      newContent1.style.color = "black";
      newContent1.style.borderRadius= "10px";
	
			newContent1.style.textAlign="center";
			newContent1.style.marginRight = "5px"
	

			var newContent2 = document.createElement("BUTTON");
			newContent2.innerHTML = newDiv.time;

			newContent2.style.paddingTop ="15px";
			newContent2.style.paddingBottom ="25px";
			newContent2.style.height="20px";
			newContent2.style.width="100px";
			newContent2.style.marginRight="5px"
      newContent2.style.color = "black";
      newContent2.style.borderRadius= "10px";
	
	

    	var newContent3 = document.createElement("BUTTON");
			newContent3.innerHTML = newDiv.name;

			newContent3.style.paddingTop ="15px";
			newContent3.style.paddingBottom ="25px";
			newContent3.style.height="20px";
			newContent3.style.width="400px";
			newContent3.style.marginRight="5px"
      newContent3.style.color = "black";
      newContent3.style.borderRadius= "10px";
	
			newDiv.style.fontSize = "20px"
    		newDiv.appendChild(newContent1);
    		newDiv.appendChild(newContent2);
    		newDiv.appendChild(newContent3);


    
	
		   
		   
    
			var test = document.getElementById('div')
			test.appendChild(newDiv);
    	};
	}; 
};


document.onkeypress = keyPress;
function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key == 13){
    newEntry();
  }

}



function placeHolder() {
  document.getElementById("inputdate").placeholder = "";
}