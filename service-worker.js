// localhost:57
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

// Check if the URL has been called more than 3 times already
function checkIfCalled(url){

  var urlInStorage;
  caches.match(url)
        .then(function (response) {
                      urlInStorage = response;
                  });

  console.log('value in storage is', urlInStorage);

  if (urlInStorage !== undefined) {
    // If yes, what is the number of times it was called?
    console.log('The number of times called: ' + urlInStorage.called);
    var urlDetails = {id:url, called: urlInStorage.called + 1};
    console.log('adding to array: ' + urlDetails);

    caches.open('deancache')
          .then(function(cache) {
            cache.put(url, Response(urlDetails));
          });

  }
  else {
    // The default setting
    var defaultDetails = {id:url, called:1};

    // Add the url into the array for the next call
    //calls.push(urlDetails);
    caches.open('deancache')
          .then(function(cache) {
            cache.put(url, Response(defaultDetails));
          });
  }
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
