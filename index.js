var element = require('domy-element');
var __routerEngine = require('page');

module.exports = function (options) {
  options = options || {};
  
  var router = function (name, options) {
    options = options || {};
    options.router = options.router || router;
    
    return new Route(name, options);
  };
  
  router._routes = {};
  router.pushState = options.pushState || false;
  router.container = (options.container)
    ? element(options.container).one()
    : element('body').one();
    
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
  
  router.empty = function () {
    router.container.innerHTML = '';
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
  
  this.router.record(this.name, options);
};

Route.prototype.route = function (name, options) {
  options = options || {};
  
  options.parent = options.parent || this;
  options.router = options.router || this.router;
  
  return new Route(name, options);
};

Route.prototype._trigger = function (changeRoute) {
  var self = this;
  
  Object.keys(this.templates).forEach(function (selector) {
    var template = element(self.templates[selector]).one();
    
    element(selector).one().innerHTML = template.outerHTML;
  });
  
  if (changeRoute === undefined || changeRoute === true) this.router.engine(this.url); 
};