
var url = window.location.href;
var k = url.match(/id_token=(.*)&access/);
var id_token = k[1];

var user_id = id_token.slice(-99);

//var user_id = 'ih8i1u8x9prbt79xr7pjj3stqx4tmrp9'
var params = {
  IdentityPoolId: "us-east-1:15d7145f-e1eb-4561-a1cb-232eab8cdc02",
  Logins: {
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_PVcCCa9S3': id_token
        }
};



var  btn = document.getElementById('button1')
var select1 = document.getElementById('choose1')
var select2 = document.getElementById('choose2')

btn.onclick = function choose(){
	var option1 = select1.options[select1.selectedIndex].value;
	var option2 = select2.options[select2.selectedIndex].value;
	console.log(option1, option2)
	if (option1 == "none" || option2 == "none"){
		console.log("no valid input")
	}
	else{
		console.log(option1, option2)
		var res = search(option1, option2)
		// pares = JSON.parse(res)
		// console.log(res)
		// console.log(typeof res)
	}
}

function search(option1, option2){

		if (option1 == 'dislike'){
			option1 = '0'
		}
		else{
			option1 = '1'
		}


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
        				"p":option1,
						"t":option2,
						"user_id":user_id
					};

					var body = {};
					var additionalParams = {};

					apigClient.preferencesGet(params, body, additionalParams)
						.then(function(result){
							console.log('200')
    						console.log(result)

    						if (option2=="movies"){
    							show(result.data.results,option1)
    						}
    		
    						if (option2 == 'music'){
    							show1(result.data.results,option1)
    						}
    						if (option2 == 'restaurants'){
    							show2(result.data.results,option1)
    						}

						}).catch( function(result){
							console.log(result);
							return result
						});


    			}
    		});

  		});

}

function show(res,option1){
	var map = document.getElementById('map')
	map.innerHTML = ''
	var test = document.getElementById('div')

	var childs=test.childNodes;  
	for(var i=childs.length-1;i>=0;i--)
	{  
	test.removeChild(childs.item(i));    
	} 
	for (i=0;i<res.length;i++){
		console.log(res[i].name)

		console.log(res[i].type)
		// console.log(res[i].preference)
		console.log(res[i].info)


	var newDiv = document.createElement('p');
	newDiv.name = res[i].name;
	newDiv.type = res[i].type;
	// newDiv.pref = res[i].preference;
	// id 需要更改，换成获取的ESid
	newDiv.id = 'rec'+i;
	// this
	newDiv.user_id = user_id;
	// newDiv.innerHtml = "test";
	// newDiv.name + newDiv.type + newDiv.pref;
	var space = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0"

	var newContent1 = document.createElement("BUTTON");
	newContent1.innerHTML = newDiv.name;


	newContent1.style.paddingTop ="15px";
	newContent1.style.paddingBottom ="25px";
	newContent1.style.height="20px";
	newContent1.style.width="200px";
	//newContent1.style.position="absolute";
	newContent1.style.textAlign="center";
	newContent1.style.marginRight = "5px"
	newContent1.style.color = "black";
	newContent1.style.borderRadius= "10px";
	//newContent1.style.margin-left = "121px";
	//newContent1.style.margin-top= "1px";

	var newContent2 = document.createElement("BUTTON");
	newContent2.innerHTML = newDiv.type;

	newContent2.style.paddingTop ="15px";
	newContent2.style.paddingBottom ="25px";
	newContent2.style.height="20px";
	newContent2.style.width="100px";
	newContent2.style.marginRight="5px"
	newContent2.style.color = "black";
	newContent2.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"
    newDiv.appendChild(newContent1);
    newDiv.appendChild(newContent2);


    if (option1 == '0'){
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/black_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
     	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "50px";
	   	img_show.style.marginRight = "50px";
    } 

    if (option1 == '1') {
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/red_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
	   	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "50px";
	   	img_show.style.marginRight = "50px";
    }


    console.log(newDiv);
	// newDiv.appendChild(img_show)
	


     	newDiv.appendChild(img_show)


     	var descrip = document.createElement("BUTTON");
		descrip.innerHTML = res[i].movie;

		descrip.style.paddingTop ="15px";
		descrip.style.paddingBottom ="70px";
		descrip.style.height="15px";
		descrip.style.width="200px";
		descrip.style.marginRight="5px"
		descrip.style.color = "black";
		descrip.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
		newDiv.style.fontSize = "20px"
    	newDiv.appendChild(descrip);



		var overview = document.createElement("BUTTON");
		overview.innerHTML = res[i].overview;

		overview.style.paddingTop ="15px";
		overview.style.paddingBottom ="70px";
		overview.style.height="20px";
		overview.style.width="420px";
		overview.style.marginRight="5px"
		overview.style.color = "black";
		overview.style.borderRadius= "10px";
		//overview.style.textAlign="center";
	// // newContent.style.fontSize = "20px"
		newDiv.style.fontSize = "20px"
    	newDiv.appendChild(overview);

    	var pic_show = document.createElement("img");
	    pic_show.src = "https://image.tmdb.org/t/p/w500"+res[i].info;
	    pic_show.style.padding = "0px";
	    pic_show.style.height = "160px";
		pic_show.style.width = "120px";
		pic_show.style.marginLeft = "30px";
		pic_show.style.marginRight = "50px";
		pic_show.style.marginBottom = "-50px";
		pic_show.style.marginTop = "50px";

		newDiv.appendChild(pic_show);




		var test = document.getElementById('div')
		test.appendChild(newDiv);



	}
}





function show1(res,option1){
	var map = document.getElementById('map')
	map.innerHTML = ''
	var test = document.getElementById('div')

	var childs=test.childNodes;  
	for(var i=childs.length-1;i>=0;i--)
	{  
	test.removeChild(childs.item(i));    
	} 
	for (i=0;i<res.length;i++){
		console.log(res[i].name)

		console.log(res[i].type)
		// console.log(res[i].preference)
		console.log(res[i].artist)
		console.log(res[i].playcount)

	var newDiv = document.createElement('p');
	newDiv.name = res[i].name;
	newDiv.type = res[i].type;
	newDiv.artist = res[i].artist;
	newDiv.playcount = res[i].playcount;
	// newDiv.pref = res[i].preference;
	// id 需要更改，换成获取的ESid
	newDiv.id = 'rec'+i;
	// this
	newDiv.user_id = user_id;
	// newDiv.innerHtml = "test";
	// newDiv.name + newDiv.type + newDiv.pref;
	var space = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0"

	var newContent1 = document.createElement("BUTTON");
	newContent1.innerHTML = newDiv.name;


	newContent1.style.paddingTop ="15px";
	newContent1.style.paddingBottom ="25px";
	newContent1.style.height="20px";
	newContent1.style.width="300px";
	//newContent1.style.position="absolute";
	newContent1.style.textAlign="center";
	newContent1.style.marginRight = "5px"
	newContent1.style.color = "black";
	newContent1.style.borderRadius= "10px";
	//newContent1.style.margin-left = "121px";
	//newContent1.style.margin-top= "1px";

	var newContent2 = document.createElement("BUTTON");
	newContent2.innerHTML = newDiv.type;

	newContent2.style.paddingTop ="15px";
	newContent2.style.paddingBottom ="25px";
	newContent2.style.height="20px";
	newContent2.style.width="100px";
	newContent2.style.marginRight="5px"
	newContent2.style.color = "black";
	newContent2.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"


	var newContent4 = document.createElement("BUTTON");
	newContent4.innerHTML = "Artist: "+ newDiv.artist;

	newContent4.style.paddingTop ="15px";
	newContent4.style.paddingBottom ="25px";
	newContent4.style.height="20px";
	newContent4.style.width="120px";
	newContent4.style.marginRight="5px"
	newContent4.style.color = "black";
	newContent4.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"



	var newContent5 = document.createElement("BUTTON");
	newContent5.innerHTML = 'Playcount: ' + newDiv.playcount;

	newContent5.style.paddingTop ="15px";
	newContent5.style.paddingBottom ="25px";
	newContent5.style.height="20px";
	newContent5.style.width="120px";
	newContent5.style.marginRight="5px"

	newContent5.style.color = "black";
	newContent5.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"
    newDiv.appendChild(newContent1);
    newDiv.appendChild(newContent2);
    newDiv.appendChild(newContent4);
    newDiv.appendChild(newContent5);

    if (option1 == '0'){
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/black_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
     	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    } 

    if (option1 == '1') {
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/red_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
	   	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    }


    console.log(newDiv);
	newDiv.appendChild(img_show)
	


     	// newDiv.appendChild(img_show)

		var newContent3 = document.createElement("BUTTON");
		newContent3.innerHTML = "Listen to Music";

		
		console.log(res[i].url)
		newContent3.url = res[i].url
		// console.log(JSON.parse(res[i].info))
		newContent3.onclick = function () {
        location.href = this.url;
    }
		newContent3.style.paddingTop ="15px";
		newContent3.style.paddingBottom ="25px";
		newContent3.style.height="20px";
		newContent3.style.width="100px";
		newContent3.style.marginRight="5px"

		newContent3.style.color = "#fff";
	
		newContent3.style.backgroundColor= "#fa4650"//"#ed3330";
		newContent3.style.borderRadius= "20px";
		newContent3.style.fontSize = "10px";
		newContent3.style.textAlign = "center";

		// // newContent.style.fontSize = "20px"
		newDiv.style.fontSize = "20px"
		newDiv.appendChild(newContent3);
		var test = document.getElementById('div')
		test.appendChild(newDiv);



	}
}




function show2(res,option1){
	var map = document.getElementById('map')
	map.innerHTML = ''
	// var test = document.getElementById('div')
	var test = document.getElementById('div')
	var address_list = [];
	var childs=test.childNodes;  
	for(var i=childs.length-1;i>=0;i--)
	{  
	test.removeChild(childs.item(i));    
	} 
	for (i=0;i<res.length;i++){
		console.log(res[i].name)

		console.log(res[i].type)
		// console.log(res[i].preference)
		console.log(res[i].address)
		console.log(res[i].cuisine)
		console.log(res[i].rating)


		address_list.push([res[i].name,res[i].address])
	var newDiv = document.createElement('p');
	newDiv.name = res[i].name;
	newDiv.type = res[i].type;
	// newDiv.type = res[i].type;
	// newDiv.type = res[i].type;
	// newDiv.pref = res[i].preference;
	// id 需要更改，换成获取的ESid
	newDiv.id = 'rec'+i;
	// this
	newDiv.user_id = user_id;
	// newDiv.innerHtml = "test";
	// newDiv.name + newDiv.type + newDiv.pref;
	var space = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0"

	var newContent1 = document.createElement("BUTTON");
	newContent1.innerHTML = newDiv.name;


	newContent1.style.paddingTop ="15px";
	newContent1.style.paddingBottom ="25px";
	newContent1.style.height="20px";
	newContent1.style.width="300px";
	//newContent1.style.position="absolute";
	newContent1.style.textAlign="center";
	newContent1.style.marginRight = "5px"
	newContent1.style.color = "black";
	newContent1.style.borderRadius= "10px";
	//newContent1.style.margin-left = "121px";
	//newContent1.style.margin-top= "1px";

	var newContent2 = document.createElement("BUTTON");
	newContent2.innerHTML = newDiv.type;

	newContent2.style.paddingTop ="15px";
	newContent2.style.paddingBottom ="25px";
	newContent2.style.height="20px";
	newContent2.style.width="100px";
	newContent2.style.marginRight="5px"
	newContent2.style.color = "black";
	newContent2.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"



	var newContent4 = document.createElement("BUTTON");
	newContent4.innerHTML = res[i].cuisine + " cuisine";

	newContent4.style.paddingTop ="15px";
	newContent4.style.paddingBottom ="25px";
	newContent4.style.height="20px";
	newContent4.style.width="100px";
	newContent4.style.marginRight="5px"
	newContent4.style.color = "black";
	newContent4.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"



	var newContent5 = document.createElement("BUTTON");
	newContent5.innerHTML = "Rating: "+ res[i].rating;

	newContent5.style.paddingTop ="15px";
	newContent5.style.paddingBottom ="25px";
	newContent5.style.height="20px";
	newContent5.style.width="100px";
	newContent5.style.marginRight="5px"
	newContent5.style.color = "black";
	newContent5.style.borderRadius= "10px";
	// // newContent.style.fontSize = "20px"
	newDiv.style.fontSize = "20px"

    newDiv.appendChild(newContent1);
    newDiv.appendChild(newContent2);
    newDiv.appendChild(newContent4);
    newDiv.appendChild(newContent5);

    if (option1 == '0'){
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/black_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
     	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    } 

    if (option1 == '1') {
     	var img_show = document.createElement("img");
     	img_show.src = "https://s3-us-west-2.amazonaws.com/mypublicimage/red_heart.png";
     	img_show.style.padding = "0px";
     	img_show.style.height = "20px";
	   	img_show.style.width = "23px";
	   	img_show.style.marginLeft = "70px";
	   	img_show.style.marginRight = "50px";
    }


    console.log(newDiv);
	newDiv.appendChild(img_show)
	


     	// newDiv.appendChild(img_show)
     	// var newContent1 = document.createElement("BUTTON");

		var newContent3 = document.createElement("BUTTON");
		newContent3.innerHTML = "Address: "+res[i].address;

		// newContent3.onclick = 
		newContent3.style.paddingTop ="15px";
		newContent3.style.paddingBottom ="25px";
		newContent3.style.height="20px";
		newContent3.style.width="400px";
		newContent3.style.marginRight="5px"
		newContent3.style.color = "black";
		newContent3.style.borderRadius= "10px";
		// // newContent.style.fontSize = "20px"
		newDiv.style.fontSize = "20px"
		newDiv.appendChild(newContent3);
		var test = document.getElementById('div')
		test.appendChild(newDiv);



	}
	console.log(address_list)
	var build = buildmap(address_list);
}

function buildmap(locations){
	// var locations = locations
	
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: new google.maps.LatLng(-33.92, 151.25),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    

    var marker, i;
    var geocoder = new google.maps.Geocoder();
    
    for (i = 0; i < locations.length; i++) { 
       
      
      (function (i){
      var contentx = locations[i][0]
      console.log(contentx)
      var res = geocoder.geocode({'address': locations[i][1]}, function(results, status) {
          if (status === 'OK') {
              map.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
              title:contentx
            });
        // var infowindow = new google.maps.InfoWindow();
        // var infowindow = new google.maps.InfoWindow({
        //         content:    contentx,
        //         maxWidth:   160
        //     });
        // var contentx = locations[i][0]
        console.log(contentx)
        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent(contentx);
        infowindow.open(map, marker);
      //       google.maps.event.addListener(marker, 'click', (function(marker,contentx, infowindow) {
      //   return function() {
      //     infowindow.setContent(contentx);
      //     infowindow.open(map, marker);
      //   }
      // })(marker,contentx, infowindow));

          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
}.call(this,i))
      };
}