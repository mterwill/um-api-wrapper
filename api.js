var https = require('https'),
    moment = require('moment'),
    token = require('./token');

/*
 * To be implemented at a later date
 */
var cache = {};

/*
 * Set configuration parameters
 *
 * @param {string} key
 * @param {string} value
 *
 */
module.exports.setKeys = function(key, value) {
    token.config[key] = value;
};

/*
 * Calls 'callback' with the JSON output from UM's API for 
 * the specified query string
 *
 * @callback callback
 *
 * @param {Object} options 
 * @param {optional string} options.host - api-gw.it.umich.edu
 * @param {string} options.path - /Curriculum/Classrooms/v1/Classrooms
 *
 */
module.exports.call = function(options, callback) {
    if(typeof options === 'undefined') {
        throw new Error('Please supply an options object');
    } else if(typeof options.path === 'undefined') {
        throw new Error('Please supply a path for your request');
    }

    // after getting our access token, make the api call
    var makeApiCall = function(accessTokenObj) {
        var getOptions = {
                host: options.host || 'api-gw.it.umich.edu',
                path: options.path,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + accessTokenObj.access_token,
                }
            },
            getCallback = function(response) {
                var responseData = '';

                response.on('data', function (chunk) {
                    responseData += chunk;
                });

                response.on('end', function () {
                    responseObj = JSON.parse(responseData);

                    callback(responseObj);
                });
            };

        https.get(getOptions, getCallback);
    };

    token.authenticate(makeApiCall);
};

/*
 * Calls 'callback' with the JSON output from UM's API when queried
 * for a room's meeting appointments 
 *
 * @callback callback
 *
 * @param {string} facilityID
 * @param {Date} startDate
 * @param {Date} endDate
 *
 */
module.exports.getMeetings = function(facilityID, startDate, endDate, callback) {
    if(!moment.isMoment(startDate) || !moment.isMoment(endDate))
        throw new Error('startDate and endDate must be moments');

    var options = {};

    options.path = '/Curriculum/Classrooms/v1/Classrooms/' + facilityID +
    '/Meetings?startDate=' + startDate.format('MM-DD-YYYY') +
    '&endDate=' + endDate.format('MM-DD-YYYY');

    module.exports.call(options, callback);
};
