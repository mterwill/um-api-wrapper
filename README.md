# UM API Wrapper 
Matthew Terwilliger, mterwil@umich.edu

University of Michigan provides several API suites available
[here](http://developer.it.umich.edu/). This node module provides a couple of
functions that may simplify interacting with them.

- UM APIs require a so-called "access token," which you use to make requests to
  the APIs themselves. These access tokens expire regularly, and must be
  refreshed using your "consumer key" and "consumer secret" via another
  endpoint.

## Getting Started

1. You must specify both a consumer key and consumer secret via the following
method:

        var api = require('um-api-wrapper');
        api.setKeys('consumerKey', CONSUMER_KEY);
        api.setKeys('consumerSecret', CONSUMER_SECRET);

2. You can now go ahead and make calls to the API of your choice without
worrying about authentication. Simply build the query, and create a function to
deal with the result as a callback.

        var options = { host: 'api-gw.it.umich.edu',
                        path: '/Mcommunity/People/v1/people/mterwil' };

        api.call(options, callback);

## Additional functions

There are several additional functions available to simplify frequent calls:

1. ``getMeetings`` returns the schedule for a given classroom

        var start = moment('2015-05-01', 'YYYY-MM-DD');
              end = moment('2015-05-03', 'YYYY-MM-DD');

        api.getMeetings('BEYST1670', start, end, callback);

    is the same as 

        var options = {};

        options.path = '/Curriculum/Classrooms/v1/Classrooms/BEYST1670' +
                       '/Meetings?startDate=05-01-2015&endDate=05-03-2015';

        api.call(options, callback);

## Caching

Caching is turned on by default. Queries are cached for a period of 12 hours.
The cache can be turned off by invoking the following function:

    api.useCache(false);

or individually, for each query by specifying an optional parameter in the 
options object (defaults to the global useCache, which is set above, or true by
default):

    options.useCache = false;

Additionally, we fall back on old cached data (even if it's older than 12 hours)
if the API is unavailable or returns an error for any reason. Otherwise, you
will get back from the server a response code 500, with an error object and
message like so:

    {
        "error": "Error getting access token: UNABLE_TO_VERIFY_LEAF_SIGNATURE"
    }
