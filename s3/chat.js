var messages = [], 
  lastUserMessage = "Hi", 
  botMessage = "Hi, this is your bot speaking, I am still under development!", 
  botName = 'ChatBot';


var url = window.location.href;
var k = url.match(/id_token=(.*)&access/);
var id_token = k[1];
console.log(id_token);

var user_id = id_token.slice(-99);


var params = {
  IdentityPoolId: "us-east-1:15d7145f-e1eb-4561-a1cb-232eab8cdc02",
  Logins: {
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_PVcCCa9S3': id_token
        }
};

//var user_id = "ih8i1u8x9prbt79xr7pjj3stqx4tmrp9";

function chatbotResponse() {


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

        var params = {"Access-Control-Allow-Origin": '*'};

        var body = {
                      "lastUserMessage": lastUserMessage,
                      "refId" :user_id
        };

        apigClient.chatbotPost(params, body, {})
          .then(function(result){

            botMessage = result.data;
            console.log(botMessage);

            messages.push(botMessage);

            for (var i = 1; i<9; i++) {
              if (messages[messages.length - i])
                document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
            }
          }).catch( function(result){
            console.log("Inside Catch function");
          });

          return botMessage;





      }
    });

  });

}


function newEntry() {
  if (document.getElementById("chatbox").value != "") {
    lastUserMessage = document.getElementById("chatbox").value;
    document.getElementById("chatbox").value = "";
    messages.push(lastUserMessage);
    botMessage = chatbotResponse();
    
    }
}


document.onkeypress = keyPress;
function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key == 13){
    newEntry();
  }

}

function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
}