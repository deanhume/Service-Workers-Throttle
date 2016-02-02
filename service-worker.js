'use strict';

// Import the dexie indexdb library
importScripts('dexie.min.js');

// localhost:57
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

// Create our database
var db = new Dexie('ThrottleDB');

// Define a schema
db.version(1)
	.stores({
		friends: 'url, timescalled, timestamp'
	});


// Open the database
db.open()
	.catch(function(error){
		console.log('Database error', error);
	});


function exceedsThreshold(event){
  let url = event.url;
  let collection = db.friends.where('url').equalsIgnoreCase(url);

  // Did we find the URL in the DB
  let collectionCount = 0;
  collection.count(function (count) {
    // we didnt find anything
    if (collectionCount === 0){
      // We didn't find anything so add it to the DB for the first time
      db.friends
      .add({
        url: url,
        timescalled: 1,
        timestamp: Date.now()
      });
    } else {
      collectionCount = count;
    }
  });

  // Loop through the results
  collection.each(function(friend) {
    if(friend)
    {
      let timeDifference = Date.now() - friend.timestamp;

      // It breaks the threshold if it's called more than 10 times in the last 2 mins - This can be set to anything
      if (friend.timescalled > 10 && timeDifference < 120000)
      {
          return new Response('', {
                    status: 408,
                    statusText: 'Request timed out.'
                });
      }
      else {
        // Delete the row
        db.friends.delete(friend.url);

        // Add it back in with the updated times called
        db.friends
        .add({
          url: url,
          timescalled: friend.timescalled + 1,
          timestamp: Date.now()
        });
      }
    }
  });

  // Return false because we havent exceeded the Threshold
  return fetch(event.request);
}

self.addEventListener('fetch', function(event) {
    event.respondWith(exceedsThreshold(event.request));
});


// steps
//
// 1. create an array with each initial fetch request
// 2. if there is more than 2(or 3?) requests for resources already in the array, add debounce or timeout
//
//
// https://remysharp.com/2010/07/21/throttling-function-calls
//
//
// good for:
//
// multiple scripts - bad perf
// ddos attacks
// searching typeahead throttling
