# domy-router
 
PushState  URL driven DOM element swapping. A router that uses css selectors to render route templates. For use with [Browserify](http://browserify.org).

Part of the [Domy module collection](https://github.com/scottcorgan/domy).

[![browser support](https://ci.testling.com/scottcorgan/domy-router.png)](https://ci.testling.com/scottcorgan/domy-router)

### What you get

* Modular. Works on its own.
* automatic and multiple view rendering for routes
* nested routes for partial view updating
* pre-route rendering callbacks
* CommonJS/Browserify/Npm power!
 
## Install
 
```
npm install domy-router --save
```
 
## Usage
 
###Basic

```js
var router = require('domy-router');
var route = router();

var someDomElement = document.createElement('div');
someDomElement.className = 'some-element';

var anotherDomElement = document.createElement('div');

var route1 = route('route1', {
  url: '/route1',
  templates: {
    '#view-container': someDomElement // fills css selector with dom element
  }
});

route1.navigate();

// Generates:
// <div id="view-container">
//   <div class="some-element"></div>
// </div>



// Nested Routes

var childRoute = route1.route('childRoute', {
  url: '/childRoute', // becomes /route1/childRoute
  templates: {
    '.some-element': anotherDomElement
  }
});

childRoute.navigate(); // navigates to /route1/childRoute

// Generates:
// <div id="view-container">
//   <div class="some-element"><div></div></div>
// </div>
```
 
### With Parameters

```js
var router = require('domy-router');
var route = router();
var someDomElement = document.createElement('div');

var user = route('userById', {
  url: '/users/:id',
  tempaltes: {
    '#user-view': someDomElement
  }
}, function (ctx, next) {
  // Works like middleware
  next();
}, function (ctx) {
  // ctx.params.id maps to the ":id" parameter in the url
});

route.navigate('/users/123');
```

 
## Run Tests
 
```
npm install
npm test
```