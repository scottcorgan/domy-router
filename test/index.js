var router = require('../index.js');
var test = require('tape');
var element = require('domy-element');
var insert = require('domy-insert');

test('sets up router', function (t) {
  t.test('defaults', function (t) {
    var route = router();
    
    t.equal(route.pushState, false, 'defaults to no pushstate');
    t.deepEqual(route.container, element('body'), 'defaults to body element');
    
    t.end();
  });
  
  t.test('override defaults', function (t) {
    var container = insert('<div class="container"></div>').end();
    
    var route = router({
      container: '.container',
      pushState: true
    });
    
    t.deepEqual(route.container, element('.container'), 'container is an element with class "container"');
    t.equal(route.pushState, true, 'pushState set to true');
    
    t.end();
  });
  
  t.end();
});

test('names a route', function (t) {
  var route = router();
  var namedRoute = route('routeName');
  
  t.equal(namedRoute.name, 'routeName', 'has the name "routeName"');
  t.ok(route._routes['routeName'], 'blank options');
  
  t.end();
});

test('sets url for route', function (t) {
  var route = router();
  var route1 = route('route1', {
    url: '/route1'
  });
  
  t.equal(route1.url, '/route1', 'sets route url');
  
  t.end();
});

test('creates a nested route', function (t) {
  var route = router();
  var parentRoute = route('parentRoute', {
    url: '/parent'
  });
  var childRoute = parentRoute.route('childRoute', {
    url: '/child'
  });
  
  t.ok(route._routes['parentRoute.childRoute'], 'contains child route');
  t.equal(childRoute.name, 'parentRoute.childRoute', 'creates nested route name');
  t.equal(childRoute.url, '/parent/child', 'nested url');
  
  t.end();
});






// Example
// var route = router({
//   container: '.view-container', // defaults to 'body'
//   pushState: true
// });

// var users = route('users', {
//   url: '/users',
//   templates: {
//     '#some-element': someTemplate
//   },
//   before: function (next) {},
//   after: function (next) {}
// });

// users.route('users.edit', {
//   url: '/:id/edit', // /users/:id/edit
//   templates: {
//     '#edit-form': editUserTemplate
//   }
// });
