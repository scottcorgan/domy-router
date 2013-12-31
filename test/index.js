var router = require('../index.js');
var test = require('tape');
var sinon = require('sinon');
var element = require('domy-element');
var insert = require('domy-insert');
var children = require('domy-children');

var container = insert('<div class="container"></div>').end();

test('sets up router', function (t) {
  t.test('defaults', function (t) {
    var route = router();
    
    t.equal(route.pushState, false, 'defaults to no pushstate');
    t.end();
  });
  
  t.test('override defaults', function (t) {
    var route = router({
      pushState: true
    });
    
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
  var route = router({
    pushState: true
  });
  
  var users = route('users', {
    url: '/users',
    templates: {'.container': element('<div class="inner-template1"></div>').one(),}
  });
  
  t.ok(users.router.engine, 'route has router engine');
  t.ok(users._trigger, 'has trigger method');
  
  t.test('replaces router conatiner with templates', function (t) {
    users._trigger({}, false);
    
    var innerTemplate1 = element('.inner-template1').one();
    
    t.equal(innerTemplate1.className, 'inner-template1', 'appended template 1');
    t.equal(children('.container').count(), 1);
    
    t.end();
  });
  
  t.test('child route also renders parent route', function (t) {
    element('.container').one().innerHTML = '';
    
    users.rendered = false;
    
    var usersFriends = users.route('friends', {
      url: '/friends',
      templates: {'.inner-template1': element('<div class="child-template"></div>').one()}
    });
    
    usersFriends._trigger({}, false);
    
    t.ok(element('.inner-template1').one(), 'parent template was rendered');
    t.ok(element('.inner-template1').one('.child-template'), 'rendered child template');
    t.end();
  });
  
  t.test('caches the rendering of parent templates', function (t) {
    element('.container').one().innerHTML = '';
    
    var route = router();
    var users = route('users', {
      url: '/users',
      templates: {'.container': element('<div class="inner-template1">inner template 1</div>').one(),}
    });
    var usersFriends = users.route('friends', {
      url: '/friends',
      templates: {'.inner-template1': element('<div class="child-template">child template</div>').one()}
    });
    
    var oldRender = users._render;
    
    users.rendered = false;
    users._trigger({}, false);
    users._render = sinon.spy();
    usersFriends._trigger({}, false);
    
    t.ok(users.rendered, 'value tracks rendered state');
    t.notOk(users._render.called, 'skips render method if already rendered');
    t.ok(usersFriends.rendered, 'rendered child template');
    
    users.rendered = false;
    users._render = oldRender;
    users._trigger({}, false);
    
    t.equal(route._routes['users.friends'].rendered, false, 'rendered reset to false');
    t.ok(users.rendered, 'parent route is still set as rendered');
    t.end();
  });
  
  t.end();
});

test('before and after callbacks', function (t) {
  var route = router();
  
  var tasks = route('tasks', {
    before: function (ctx, next) {
      t.equal(ctx.params.param1, 'param1', 'passes parameters to before method');
      t.ok(next, 'passes through callback');
      
      ctx.testValue = 'testing';
      next();
    },
    
    after: function (ctx) {
      t.equal(ctx.params.param1, 'param1', 'passes parameters to after method');
      t.equal(ctx.testValue, 'testing', 'passes through values on the context object')
      t.end();
    }
  });
  
  tasks._trigger({ params: { param1: 'param1' } }, false);
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
