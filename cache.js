var cache = {};

/*
 * Returns whether or not the object is in our cache, and saved
 * within the last 12 hours.
 *
 * @param {Object} options 
 * @returns {bool}
 *
 */
module.exports.isCached = function(options) {
    options.host = options.host || 'api-gw.it.umich.edu';
    var searchQuery = options.host + options.path;

    if(searchQuery in cache) {
        var timeDiff = Date.now() - cache[searchQuery].timestamp;

        // (now - time saved) < 12 hours
        return timeDiff < 43200000;
    } else {
        return false;
    }
};

/*
 * Get the object from our cache if it exists, else do not
 * call the callback
 *
 * @param {Object} options 
 * @callback callback
 *
 */
module.exports.getCachedResponse = function(options, callback) {
    options.host = options.host || 'api-gw.it.umich.edu';
    var searchQuery = options.host + options.path;
    
    if(searchQuery in cache) {
        callback(cache[searchQuery].data);
    }
};

/*
 * Store a new object to our cache
 *
 * @param {Object} options 
 * @callback callback
 *
 */
module.exports.storeCachedResponse = function(options, responseObj) {
    options.host = options.host || 'api-gw.it.umich.edu';
    var searchQuery = options.host + options.path;
    
    cache[searchQuery] = { 
        timestamp: Date.now(),
        data: responseObj
    };
};

/*
 * Empty the cache
 *
 */
module.exports.emptyCache = function() {
    cache = {};
};
