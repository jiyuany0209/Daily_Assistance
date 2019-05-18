
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

//var user_id = 'ih8i1u8x9prbt79xr7pjj3stqx4tmrp9'
var  select = document.getElementById('choose')
select.onchange = function choose(){
	var textinput = select.options[select.selectedIndex].text;
	console.log(textinput, user_id)
	if (textinput == "please select one"){
		console.log("no valid input")
	}
	else{
		console.log(textinput, user_id)
		var res = search(textinput)
		// pares = JSON.parse(res)
		console.log(res)
		console.log(typeof res)
	}
}

function search(textinput){

	AWS.config.region = 'us-east-1';
  	var newcog = new AWS.CognitoIdentity()

  	newcog.getId(params, function(err, data){

  		if (err) {
  			console.log(err)
  		}

  		else {
  			var iden_id = data['IdentityId']
  		}

  		console.log(iden_id)

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
        			"t":textinput,
					"user_id":user_id
				};

				var body = {};

				var additionalParams = {};

				apigClient.recordsGet(params, body, additionalParams)
					.then(function(result){
						console.log('200')
    					console.log(result)
    					console.log(typeof result)
    					// console.log(Object.keys(result.data.results[0]));
    					console.log(result.data.results)
    					if (result.data.results.length == 0){
                  clear()
              }else{
              show(result.data.results)
    					return result.data.results
              }
					}).catch( function(result){
						console.log(result);
						return result
					});



        		
    		}
    	});

  	});


}
function clear(){
  var test = document.getElementById('div')

  var childs=test.childNodes;  
  for(var i=childs.length-1;i>=0;i--)
  {  
  test.removeChild(childs.item(i));    
  } 
}

function show(res){
	var test = document.getElementById('div')

	var childs=test.childNodes;  
	for(var i=childs.length-1;i>=0;i--)
	{  
	test.removeChild(childs.item(i));    
	} 
	for (i=0;i<res.length;i++){
		console.log(res[i].name)

		console.log(res[i].type)
		console.log(res[i].preference)


	var newDiv = document.createElement('p');
	newDiv.name = res[i].name;
	newDiv.type = res[i].type;
	newDiv.pref = res[i].preference;
	
	newDiv.id = 'rec'+i;
	
	newDiv.user_id = user_id;
	

	var newContent1 = document.createElement("BUTTON");
	newContent1.innerHTML = newDiv.name;


	newContent1.style.paddingTop ="15px";
	newContent1.style.paddingBottom ="25px";
	newContent1.style.height="20px";
	newContent1.style.width="300px";
  newContent1.style.color = "black";
  newContent1.style.borderRadius= "10px";

	newContent1.style.textAlign="center";
	newContent1.style.marginRight = "5px"
	
	var newContent2 = document.createElement("BUTTON");
	newContent2.innerHTML = newDiv.type;

	newContent2.style.paddingTop ="15px";
	newContent2.style.paddingBottom ="25px";
	newContent2.style.height="20px";
	newContent2.style.width="100px";
	newContent2.style.marginRight="5px"
  newContent2.style.color = "black";
  newContent2.style.borderRadius= "10px";
	
	newDiv.style.fontSize = "20px"
    newDiv.appendChild(newContent1);
    newDiv.appendChild(newContent2);


    if (newDiv.pref == '0'){
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/black_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
     	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    } 

    if (newDiv.pref == '1') {
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/red_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
	   	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    }

    if (newDiv.pref == '2') {
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/white_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
	   	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    }

    console.log(newDiv);
	newDiv.appendChild(img_show)
	var btn = document.createElement("BUTTON");
	btn.innerHTML = "Like";
	
	btn.style.color = "#fff";
	btn.style.height="20px";
	btn.style.width="80px";
	btn.style.backgroundColor= "#fa4650"//"#ed3330";
	btn.style.borderRadius= "20px";
	btn.style.marginRight = "5px";
	btn.style.textTransform="uppercase";
	btn.style.fontSize = "10px";
	btn.style.textAlign = "center";
	btn.style.paddingTop = "10px";
	btn.style.paddingBottom = "20px";

	   	 
	btn.id = newDiv.id;
	btn.name = newDiv.name;
	btn.type1 = newDiv.type;
	btn.pref = newDiv.pref;
	btn.user_id = user_id;

	var btn2 = document.createElement("BUTTON");
	btn2.innerHTML = "Dislike";
	//var btnContent = document.createTextNode("if you like");
	btn2.style.color = "#fff";
	btn2.style.height="20px";
	btn2.style.width="80px";
	btn2.style.backgroundColor= "#629dfc";
	btn2.style.borderRadius= "20px";
	btn2.style.marginRight = "5px";
	btn2.style.textTransform="uppercase";
	btn2.style.fontSize = "10px";
	btn2.style.textAlign = "center";
	btn2.style.paddingTop = "10px";
	btn2.style.paddingBottom = "20px";
	   	 
	btn2.id = newDiv.id;
	btn2.name = newDiv.name;
	btn2.type1 = newDiv.type;
	btn2.pref = newDiv.pref;
	btn2.user_id = user_id;
	   	   
	btn.onclick = function func(){
		
		var parent = this.parentNode
		console.log(parent.childNodes[2])
		parent.childNodes[2].src = "https://s3-us-west-2.amazonaws.com/mypublicimage/red_heart.png"

    var body = {

                "t":this.type1,
                "p":"1",
                "user_id":this.user_id,
                "name":this.name
              };
		

		AWS.config.region = 'us-east-1';
  	var newcog = new AWS.CognitoIdentity()

  		newcog.getId(params, function(err, data){

  			if (err) {
  				console.log(err)
  			}
  			else {
  				var iden_id = data['IdentityId']
  			}

  			console.log(iden_id)

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


        			var params = {};



        			var additionalParams = {};

        			apigClient.preferencesPost(params, body, additionalParams)
        				.then(function(result){
        					console.log('200')
    						console.log(result)

        				}).catch( function(result){
        					console.log(result)
        				});




    			}
    		});

  		});


};
		   

	btn2.onclick = function func(){
		
		var parent = this.parentNode
		console.log(parent.childNodes[2])
		parent.childNodes[2].src = "https://s3-us-west-2.amazonaws.com/mypublicimage/black_heart.png"

		AWS.config.region = 'us-east-1';
  	var newcog = new AWS.CognitoIdentity()

    var body = {

            "t":this.type1,
            "p":"0",
            "user_id":this.user_id,
            "name":this.name
              };

  		newcog.getId(params, function(err, data){

  			if (err) {
  				console.log(err)
  			}
  			else {
  				var iden_id = data['IdentityId']
  			}

  			console.log(iden_id)

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


        			var params = {};



        			var additionalParams = {};

        			apigClient.preferencesPost(params, body, additionalParams)
        				.then(function(result){
        					console.log('200')
    						console.log(result)

        				}).catch( function(result){
        					console.log(result)
        				});




    			}
    		});

  		});
		

};

		   
     	newDiv.appendChild(btn)
     	newDiv.appendChild(btn2)
		var test = document.getElementById('div')
		test.appendChild(newDiv);



	}
}