var element = require('domy-element');
var __routerEngine = require('page');
var page = require('page');

// Sets everything up
module.exports = function (options) {
  options = options || {};
  
  var router = function (name, options) {
    options = options || {};
    options.router = options.router || router;
    
    var callbacks = [].slice.call(arguments, 2);
    
    return new Route(name, options, callbacks);
  };
  
  router._routes = {};
  router.pushState = options.pushState || false;
    
  router._record = function (routeName, options) {
    options = options || {};
    router._routes[routeName] = options;
  };
  
  router._buildName = function (parent, childName) {
    return (parent && childName)
      ? parent.name + '.' + childName
      : childName;
  };
  
  router._buildUrl = function (parent, childUrl) {
    return (parent && childUrl)
      ? parent.url + childUrl
      : childUrl || '/';
  };
  
  // Reset cache for current and child templates
  router.resetRenderedChildren = function (parent) {
    Object.keys(router._routes).forEach(function (routeName) {
      if (!parent) return;
      
      var len = parent.name.length;
      
      if (routeName.substring(0, len) === parent.name) {
        router._routes[routeName].rendered = false;
      }
    });
  };
  
  router.navigate = function (path) {
    router.engine(path);
  };
  
  router.engine = __routerEngine;
  
  return router;
};

// Route
var Route = function (name, options, callbacks) {
  var self = this;
  
  this.router = options.router;
  this.options = options;
  this.name = this.router._buildName(options.parent, name);
  this.url = this.router._buildUrl(options.parent, options.url);
  this.templates = options.templates || {};
  this.before = options.before || function (params, next) {next();};
  this.after = options.after || function () {};
  this.callbacks = callbacks || [];
  
  // Add the template render method
  // to the end of the method chain
  this.callbacks.push(function (ctx) {
    self.render(ctx);
  });
  
  // Track the routes internally
  this.router._record(this.name, options);
  
  // attach the callbacks to our routes
  this.router.engine.apply(this.router.engine, [this.url].concat(this.callbacks));
};

Route.prototype.route = function (name, options) {
  options = options || {};
  
  options.parent = options.parent || this;
  options.router = options.router || this.router;
  
  return new Route(name, options);
};

Route.prototype.render = function (ctx, changeRoute) {
  ctx = ctx || {};
  
  var self = this;
  
  this.before(ctx, function () {
    if (!self.rendered) self._renderTemplates(ctx);
    self.after(ctx);
  });
};

Route.prototype._renderTemplates = function (ctx) {
  var self = this;
  
  // Set up parent
  // reset child templates rendered value
  if (this.options.parent) this.options.parent.render(ctx, false);
  this.router.resetRenderedChildren(this.options.parent);
  
  Object.keys(this.templates).forEach(this._renderTemplate(this));
  
  this.rendered = true;
};

Route.prototype._renderTemplate = function (context) {
  return function (selector) {
    var template = element(context.templates[selector]).one();
    element(selector).one().innerHTML = template.outerHTML;
  };
};

// TODO: naviage should take a set of arguments
// that map to the wildcard argumetns in the route path
Route.prototype.navigate = function () {
  this.router.navigate(this.url);
};