exports.handler = async (event) => {

    console.log('Loading function');
    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-east-1'});
    var lexruntime = new AWS.LexRuntime();
    
    console.log(event);


    var lexChatbotParams = {
        botAlias: 'testzero',
        botName: 'Daily_Assistance',
        inputText: JSON.parse(event.body).lastUserMessage,
        userId: JSON.parse(event.body).refId,
        requestAttributes: {},
        sessionAttributes: {}
    };

    return lexruntime.postText(lexChatbotParams).promise()
    .then((data) =>{
        console.log(data);
        const response = {
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            statusCode: 200,
            body: data.message
        };
        return response;
    })
    .catch((err) =>{
        console.log(err);
    });
};