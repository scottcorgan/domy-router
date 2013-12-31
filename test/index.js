var router = require('../index.js');
var test = require('tape');
var sinon = require('sinon');
var element = require('domy-element');
var insert = require('domy-insert');
var children = require('domy-children');
var container = insert('<div class="container"></div>').end();


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
  var route = router();
  var users = route('users', {
    url: '/users',
    templates: {'.container': element('<div class="inner-template1"></div>').one(),}
  });
  
  t.ok(users.router.engine, 'route has router engine');
  t.ok(users.render, 'has trigger method');
  
  t.test('replaces router conatiner with templates', function (t) {
    users.render({});
    
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
    
    usersFriends.render({});
    
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
    
    var oldRender = users._renderTemplates;
    
    users.rendered = false;
    users.render({});
    users._renderTemplates = sinon.spy();
    usersFriends.render({});
    
    t.ok(users.rendered, 'value tracks rendered state');
    t.notOk(users._renderTemplates.called, 'skips render method if already rendered');
    t.ok(usersFriends.rendered, 'rendered child template');
    
    users.rendered = false;
    users._renderTemplates = oldRender;
    users.render({});
    
    t.equal(route._routes['users.friends'].rendered, false, 'rendered reset to false');
    t.ok(users.rendered, 'parent route is still set as rendered');
    t.end();
  });
  
  t.end();
});

test('executes route callback chain', function (t) {
  var route = router();
  
  var tasks = route('tasks', {url: '/tasks'}, function (ctx, next) {
    t.ok(next, 'provdes callback');
    next();
  }, function (ctx) {
    t.ok(ctx, 'provides the context');
    t.end();
  });
  
  tasks.navigate();
  
  t.equal(tasks.callbacks.length, 3, 'stores all callbacks');
});


test('renders template when navigating to url', function (t) {
  element('body').innerHTML = '';
  insert('<div class="container"></div>').end();
  
  var route = router();
  var testing = route('testing', {
    url: '/testing',
    templates: {
      '.container': element('<div class="testing"></div>').one()
    }
  });
  
  testing.navigate();
  
  t.equal(window.location.pathname, '/testing', 'navigated to url');
  t.ok(element('.testing').one(), 'appended template');
  t.end();
});

test('passes parameters into method chain', function (t) {
  element('body').innerHTML = '';
  insert('<div class="container"></div>').end();
  
  var route = router();
  var testing = route('testing', {
    url: '/testing/:id',
    templates: {
      '.container': element('<div class="testing"></div>').one()
    }
  }, function (ctx, next) {
    t.equal(ctx.params.id, '123', 'passed in id');
    t.end();
  });
  
  route.navigate('/testing/123');
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
//   }
// }, function () {}, function () {});

// users.route('edit', {
//   url: '/:id/edit', // /users/:id/edit
//   templates: {
//     '#edit-form': editUserTemplate
//   }
// });
