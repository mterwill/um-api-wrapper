var https = require('https'),
    moment = require('moment'),
    token = require('./token'),
    cache = require('./cache');

var useCache = true;

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
 * Enable/disable the cache
 *
 * @param {bool} _useCache
 *
 */
module.exports.useCache = function(_useCache) {
    useCache = Boolean(_useCache);
};

/*
 * Calls 'callback' with the JSON output from UM's API for 
 * the specified query string
 *
 * @callback callback
 *
 * @param {Object} options 
 * @param {optional string} options.host - api-gw.it.umich.edu
 * @param {optional bool} options.useCache - true/false
 * @param {string} options.path - /Curriculum/Classrooms/v1/Classrooms
 *
 */
module.exports.call = function(options, callback) {
    if(typeof options === 'undefined') {
        throw new Error('Please supply an options object');
    } else if(typeof options.path === 'undefined') {
        throw new Error('Please supply a path for your request');
    }

    options.useCache = options.useCache || useCache;

    // after getting our access token, make the api call
    var makeApiCall = function(accessTokenObj) {
        if('error' in accessTokenObj) {
            if(options.useCache && cache.isCached(options) >= 0) {
                // the object is cached, even if it's old, let's return
                // that object.
                cache.getCachedResponse(options, callback);
                return;
            } else {
                // the server is unavailable, and the object isn't cached
                // at all, or the cache is off. we return an error:
                callback({ error: 'Error getting access token: ' + 
                    accessTokenObj.error });
                return;
            }
        }

        var getOptions = {
            host: options.host || 'api-gw.it.umich.edu',
            path: options.path,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + accessTokenObj.
                    token.access_token,
            }
        },
        getCallback = function(response) {
            // non-standard response
            if(response.statusCode !== 200) {
                if(options.useCache && cache.isCached(options) >= 0) {
                    // the object is cached, even if it's old,
                    // let's return that object.
                    cache.getCachedResponse(options, callback);
                    return;
                } else {
                    // the server is unavailable, and the object isn't
                    // cached at all, or the cache is off.
                    // we return an error:
                    callback({ error: 'UM API returned non-200 status code' });
                    return;
                }
            }

            var responseData = '';

            response.on('data', function (chunk) {
                responseData += chunk;
            });

            response.on('end', function () {
                try {
                    responseObj = JSON.parse(responseData);
                } catch(e) {
                    if(options.useCache && cache.isCached(options) >= 0) {
                        // the object is cached, even if it's old,
                        // let's return that object.
                        cache.getCachedResponse(options, callback);
                        return;
                    } else {
                        // the server is unavailable, and the object isn't
                        // cached at all, or the cache is off.
                        // we return an error:
                        callback({ error: 'JSON parse error: ' + e });
                        return;
                    }
                }

                if(options.useCache) {
                    // save new data to our cache
                    cache.storeCachedResponse(options, responseObj);
                }

                callback({ result: responseObj });
            });
        };

        https.get(getOptions, getCallback).on('error', function(e) {
            if(options.useCache && cache.isCached(options) >= 0) {
                // the object is cached, even if it's old, let's return
                // that object.
                cache.getCachedResponse(options, callback);
                return;
            } else {
                // the server is unavailable, and the object isn't cached
                // at all, or the cache is off. we return an error:
                callback({ error: 'API call error: ' + e.message });
                return;
            }
        });
    };

    if(options.useCache && cache.isCached(options) > 0) {
        // we have a valid, cached response. callback with that!
        cache.getCachedResponse(options, callback);
    } else {
        // make an api call
        token.authenticate(makeApiCall);
    }
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
