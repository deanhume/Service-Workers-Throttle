'use strict';

// A function to throttle any fetch events
function timeout(fn, delay) {
return new Promise(function(resolve, reject) {
    var timer = null;
    return function () {
      console.log('timeout');
      console.log(arguments);
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        resolve(fn.apply(context, args));
      }, delay);
    };
  });
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  if (self.clients && clients.claim) {
    clients.claim();
  }
});


self.addEventListener('fetch', function(event) {
  timeout(() => fetch(event.request), 2000).then(function(value) {
    console.log(value);
  });
});

// self.addEventListener('fetch', function(event) {
//
//    //event.respondWith(debounce(fetch(event.request), 2000));
//    event.respondWith(debounce(() => fetch(event.request)
//                                     .then(function (resp) {
//                                       console.log(resp);
//                         return resp.response;
//                     }), 2000));
// });
