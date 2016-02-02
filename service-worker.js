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
var db = new Dexie('MyDatabase');

// Define a schema
db.version(1)
	.stores({
		friends: 'url, timescalled'
	});


// Open the database
db.open()
	.catch(function(error){
		alert('Uh oh : ' + error);
	});


// Check if the URL has been called more than 3 times already
function checkIfCalled(url){

  var collection = db.friends.where('url').equalsIgnoreCase(url);

  var collectionCount = 0;
  collection.count(function (count) {
    collectionCount = count;
  });

  // we didnt find anything
  if (collectionCount === 0){
    // We didn't find anything so add it to the DB
    console.log('we didnt find a record for', url);
    db.friends
    .add({
      url: url,
      timescalled: 1
    });
  }


  collection.each(function(friend) {
    console.log('we found a record for', url);
    // Check if the value already exists and breaks the threshold
    if(friend)
    {
      console.log('it has a value', friend.timescalled);

      // It breaks the threshold
      if (friend.timescalled > 5)
      {
          console.log('its broken the threshold', url);
      }
      else {
        console.log('its been called more than once', url);

        // Delete the row
        db.friends.delete(friend.url);

        // Add a new one back in
        var updatedTimesCalled = friend.timescalled + 1;

        console.log('im updating it to ', updatedTimesCalled);

        db.friends
        .add({
          url: url,
          timescalled: updatedTimesCalled
        });
      }
    }
  });
}

self.addEventListener('fetch', function(event) {
  checkIfCalled(event.request.url);
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
