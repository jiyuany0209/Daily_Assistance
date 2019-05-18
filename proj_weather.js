
exports.handler = (event, context, callback) => {
    //var intent_name = event.currentIntent.name;
    var http = require('https');
    var AWS = require('aws-sdk');
    var city = event.currentIntent.slots.City;
    console.log(city);
    city = city.replace(/\s+/g,'&');
    console.log(city)
    var api_key = "d83f8f672e05511df8994a5aaef2b918";
    var options = {
        "method": "GET",
        "hostname": "api.openweathermap.org",
        "port": null,
        "path": `/data/2.5/weather?q=${city}&APPID=${api_key}`
    };
    
    var weatherResults = '';
    console.log(options);
    var req = http.request(options, function (res) {
        var chunks = [];
        console.log(res);
        console.log(`statusCode: ${res.statusCode}`);
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body);
            //var weatherResponse = body.toString();
            weatherResults = JSON.parse(body);
            console.log(weatherResults);
            var description = weatherResults.weather[0].main;
            var temp = Math.floor(weatherResults.main.temp - 273);
            var pressure = weatherResults.main.pressure;
            var humidity = weatherResults.main.humidity;
            console.log(description+temp+pressure+humidity);
            
            var response = {
                "dialogAction": {
                    "type": "Close",
                    "fulfillmentState": "Fulfilled",
                    "message": {
                        "contentType": "PlainText",
                        "content": `The weather is ${description}, temperature: ${temp}, pressure: ${pressure}, humidty: ${humidity}.`
                    }
                }
            };
            //console.log(response);
            callback(null, response);
            
        });
        req.on('error', (error) => {
            console.log('fail');
            console.error(error);
        }); 
    });
    req.end();
    //onsole.log(req);
};
