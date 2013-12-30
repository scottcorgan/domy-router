var router = require('../index.js');
var test = require('tape');
var element = require('domy-element');
var insert = require('domy-insert');
var children = require('domy-children');

test('sets up router', function (t) {
  t.test('defaults', function (t) {
    var route = router();
    
    t.equal(route.pushState, false, 'defaults to no pushstate');
    t.deepEqual(route.container, element('body').one(), 'defaults to body element');
    t.end();
  });
  
  t.test('override defaults', function (t) {
    var container = insert('<div class="container"></div>').end();
    
    var route = router({
      container: '.container',
      pushState: true
    });
    
    t.deepEqual(route.container, element('.container').one(), 'container is an element with class "container"');
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

test('templates', function (t) {
  insert('<div id="template1"></div>').end('.container');
  // insert('<div class="random-div"></div>').end('.container');
  
  var route = router({
    pushState: true
  });
  
  var users = route('users', {
    url: '/users',
    templates: {
      '#template1': element('<div class="inner-template1"></div>').one(),
    }
  });
  
  t.ok(users.router.engine, 'route has router engine');
  t.ok(users._trigger, 'has trigger method');
  
  t.test('replaces router conatiner with templates', function (t) {
    users._trigger(false);
    
    var innerTemplate1 = element('.inner-template1').one();
    
    t.equal(innerTemplate1.className, 'inner-template1', 'appended template 1');
    t.equal(children('#template1').count(), 1);
    
    t.end();
  });
  
  
  t.end();
});






// Example
// var route = router({
//   container: '.view-container', // defaults to 'body'
//   pushState: true
// });

// var users = route('users', {
//   url: '/users',
//   template: usersTemplate,
//   templates: {
//     '#some-element': someTemplate
//   },
//   before: function (next) {},
//   after: function (next) {}
// });

// users.route('edit', {
//   url: '/:id/edit', // /users/:id/edit
//   templates: {
//     '#edit-form': editUserTemplate
//   }
// });
