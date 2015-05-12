var https = require('https');

module.exports.config = {};

var accessTokenObj;

/*
 * Checks to see if we already have a valid access token, if so, proceed
 * with that. If not, either generate a new one, or refresh the current.
 *
 * @callback callback
 *
 */
module.exports.authenticate = function(callback) {
    if(typeof accessTokenObj !== 'undefined') {
        if(Date.now() > accessTokenObj.expires_datetime) {
            // console.log('need to get a new token');
            getAccessToken(callback);
        } else {
            // console.log('token valid, and not expired');
            callback({ token: accessTokenObj });
        }
    } else {
        // console.log('need to get a new token');
        getAccessToken(callback);
    }
};

/*
 * Gets a new access token
 *
 * @callback callback
 *
 */
var getAccessToken = function(callback) {
    if(typeof module.exports.config.consumerKey === 'undefined' || 
            typeof module.exports.config.consumerSecret === 'undefined')
        throw new Error('Must specify consumer key and secret');

    var combinedKey = module.exports.config.consumerKey+ ':' + 
                        module.exports.config.consumerSecret,
        encodedKey = new Buffer(combinedKey).toString('base64'),
        postData = 'grant_type=client_credentials&scope=PRODUCTION',
        postOptions = {
            method: 'POST',
            host: 'api-km.it.umich.edu',
            path: '/token',
            headers: {
                'Authorization': 'Basic ' + encodedKey,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        },
        postCallback = function(response) {
            var tokenData = '';
            response.on('data', function (chunk) {
                tokenData += chunk;
            });

            response.on('end', function () {
                try {
                    accessTokenObj = JSON.parse(tokenData);
                } catch(e) {
                    callback({ error: 'JSON parse error: ' + e });
                    return;
                }

                accessTokenObj.expires_datetime = new Date();
                accessTokenObj.expires_datetime = new Date(
                        accessTokenObj.expires_datetime.getTime() + 
                        accessTokenObj.expires_in * 1000);

                callback({ token: accessTokenObj });
            });
        },
        postReq = https.request(postOptions, postCallback);

    postReq.write(postData);

    postReq.on('error', function(e) {
        callback({ error: e.message });
    });

    postReq.end();
};
