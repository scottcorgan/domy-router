var element = require('domy-element');

var router = function (options) {
  options = options || {};
  
  var newRoute = function (name, options) {
    return new Route(newRoute, name, options);
  };
  
  newRoute._routes = {};
  newRoute.pushState = options.pushState || false;
  newRoute.container = (options.container)
    ? element(options.container)
    : element('body');
    
  newRoute.record = function (routeName, options) {
    options = options || {};
    newRoute._routes[routeName] = options;
  };
  
  newRoute._buildName = function (parent, childName) {
    return (parent && childName)
      ? parent.name + '.' + childName
      : childName;
  };
  
  newRoute._buildUrl = function (parent, childUrl) {
    return (parent && childUrl)
      ? parent.url + childUrl
      : childUrl;
  };
  
  return newRoute;
};

// Route
var Route = function (router, name, options) {
  options = options || {};
  
  this.router = router;
  this.options = options;
  this.name = this.router._buildName(options.parent, name);
  this.url = this.router._buildUrl(options.parent, options.url);
  
  this.router.record(this.name, options);
};

Route.prototype.route = function (name, options) {
  options = options || {};
  
  options.parent = this;
  
  return new Route(this.router, name, options);
}

module.exports = router;

