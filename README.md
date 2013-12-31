# domy-router
 
PushState  URL driven DOM element swapping. A router that uses css selectors to render route templates. For use with [Browserify](http://browserify.org).

Part of the [Domy module collection](https://github.com/scottcorgan/domy).

[![browser support](https://ci.testling.com/scottcorgan/domy-router.png)](https://ci.testling.com/scottcorgan/domy-router)

### What you get

* Modular. Works on its own.
* Automatic and multiple view rendering for routes
* Nested routes for partial view updating
* Pre-route rendering callbacks
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
  templates: {
    '#user-view': someDomElement
  }
}, function (ctx, next) {
  // Works like middleware
  next();
}, function (ctx, next) {
  // ctx.params.id maps to the ":id" parameter in the url
  next();
});

route.navigate('/users/123');
```

## Instance

### router()

* Factory to set up a new instance of the Domy router.

```js
var router = require('domy-router');
var route = router();
```

## Instance Methods

The instance is both a function and an object. The function generates a new route. The object performs basic routing actions suchs as:
* `navigate(path)` - navigates to the given path

```js
var router = require('domy-router');
var route = router();

route.naviagate('/some-route');
```

### route(name[, options, callbacks]);

Each route will get rendered only once. If the route has been rendered, it simply skips the rendering step, but performs every other route sequence.

* `path` - the name of the route. Used to create nested routes.
* `options` - options to set on the route
  * `url` - the url of the route. If it is a nested route, it will be prepended with its parent route
  * `templates` - a key/value object list that tells the router to put the given element (value) into the given css selector (key)
    * `key` - a css selector (document.querySelector) to put the template in
    * `value` - the DOM element to fill the css selector element with (must be a created DOM element)
  * `callbacks` - after `path` and `options`, you can have an unlimited amount of callbacks to perform BEFORE the templates get rendered. Each callbcak is passed a context, `ctx` object and a `next` callback
    * `ctx` - contains the parameters if the url has any. You can also use this value to pass values to other callbacks
    * `next` - you  ust call this callback in order for the callback chain to continue

```js
var router = require('domy-router');
var route = router();

var someTemplate = document.createElement('div');
someTemplate.innerHTML = 'My Template';

var someRoute = route('someRoute', {
  url: '/some-route',
  templates: {
    '#templateElement': someTemplate
  }
}, function (ctx, next) {
  ctx.someValue = 'NPM';
  next();
}, function (ctx, next) {
  // ctx.someValue is now available to me
  next();
}));
```

## Nested Routes

Nested routes are simple and they give you the ability to render or update only a given set of elements within the parent template. To use nested routes, you simply create a route, then you create a child route from that route:

```js
var router = require('domy-router');
var route = router();

var parentRoute = route('parentRoute', {
  url '/parent-route'
});

var childRoute = parentRoute.route('childRoute', {
  url: '/child-route' // this becomes /parent-route/child-route
});
```

If you include the `templates` options for the child route, it will not re-render the parent templates, but only the child templates.
 
## Route Templates

A powerful feature of **domy-router** is it's ability to map dom elements/templates to css selectors. This lets you update any number of areas in the html on route change. It gets even more useful when with nested routes. You can update multiple areas of parent template on route change.

```js
var router = require('domy-router');
var route = router();
var usersList = require('./templates/users-list.js');
var usersOnline = require('./templates/users-online.js');

var users = route('users', {
  url: '/users',
  templates: {
    '#users-list': usersList, // programmatically created DOM element
    '#users-online': usersOnline // programmatically created DOM element
  }
});

route.navigate('/users');
```

## Route Callback Chains

Each route gives you the ability to have any number of callbacks execute before the route renders the templates. THis is useful for authentication, retreiver user information, showing a loader, etc.

```js
var router = require('domy-router');
var route = router();
var usersModel = require('./models/users');

var users = route('users', {
   url: '/users/:id'
}, function (ctx, next) {
  usersModel.getById(ctx.params.id, function (users) {
    ctx.users = users;
    next();
  });
}, function (ctx, next) {
  // ctx.users is now available
  next();
});
```

## Run Tests
 
```
npm install
npm test
```
