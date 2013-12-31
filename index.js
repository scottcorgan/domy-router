var element = require('domy-element');
var __routerEngine = require('page');

// Sets everything up
module.exports = function (options) {
  options = options || {};
  
  var router = function (name, options) {
    options = options || {};
    options.router = options.router || router;
    
    return new Route(name, options);
  };
  
  router._routes = {};
  router.pushState = options.pushState || false;
    
  router.record = function (routeName, options) {
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
      : childUrl;
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
  
  router.engine = __routerEngine;
  
  return router;
};

// Route
var Route = function (name, options) {
  this.router = options.router;
  this.options = options;
  this.name = this.router._buildName(options.parent, name);
  this.url = this.router._buildUrl(options.parent, options.url);
  this.templates = options.templates || {};
  
  this.before = options.before || function (params, next) {next();};
  this.after = options.after || function () {};
  
  this.router.record(this.name, options);
  
  // this.router.engine(this.url, function (ctx, next) {
  //   // before
  //   next();
  // }, function (ctx, next) {
  //   // handler
  //   next();
  // }, function (ctx) {
  //   // after
  // });
};

Route.prototype.route = function (name, options) {
  options = options || {};
  
  options.parent = options.parent || this;
  options.router = options.router || this.router;
  
  return new Route(name, options);
};

Route.prototype._trigger = function (ctx, changeRoute) {
  var self = this;
  
  this.before(ctx, function () {
    if (!self.rendered) self._renderTemplates(ctx);
    if (changeRoute === undefined || changeRoute === true) self.router.engine(self.url);
    self.after(ctx);
  });
};

Route.prototype._renderTemplates = function (ctx) {
  var self = this;
  
  // Set up parent
  // reset child templates rendered value
  if (this.options.parent) this.options.parent._trigger(ctx, false);
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