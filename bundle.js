(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var element = require('domy-element');

var router = function (options) {
  options = options || {};
  
  var newRoute = function (name, options) {
    var _route = new Route(newRoute, name, options);
    
    return _route;
  };
  
  newRoute._routes = {};
  newRoute.pushState = options.pushState || false;
  newRoute.container = (options.container)
    ? element(options.container)
    : element('body');
    
  newRoute.record = function (routeName, options) {
    options = options || {};
    newRoute._routes[routeName] = options
  };
  
  newRoute._buildChildName = function (parentName, chidlName) {
    return parentName + '.' + chidlName;
  };
  
  return newRoute;
};

// Route
var Route = function (router, name, options) {
  options = options || {};
  
  this.router = router;
  this.name = name;
  this.options = options;
  
  this.url = options.url;
  
  this.router.record(name, options);
};

Route.prototype.route = function (name, options) {
  options = options || {};
  
  var childName = this.router._buildChildName(this.name, name);
  
  options.url = (options.url)
    ? this.options.url + options.url
    : options.url;
  
  return new Route(this.router, childName, options);
}

module.exports = router;


},{"domy-element":2}],2:[function(require,module,exports){
var domify = require('domify');
var regular = require('regular');

var element = module.exports = function (selector) {
  return new Element(selector);
};

var Element = function (selector) {
  this._type = whichType(selector);
  this._selector = selector;
  this._context = document;
};

Element.prototype.one = function (contextSelector) {
  if (contextSelector) this._setSelectorContext(contextSelector);
  
  return this._queryByType('querySelector');
};

Element.prototype.all = function (contextSelector) {
  if (contextSelector) this._setSelectorContext(contextSelector);
  
  var els = this._queryByType('querySelectorAll');
  
  // Make sure it's always an array
  return (els && els.length)
    ? [].slice.call(els, 0)
    : [els];
};

Element.prototype._queryByType = function (queryMethod) {
  if (this._type === 'dom') return this._selector;
  if (this._type === 'html') return domify(this._selector);
  if (this._type === 'selector') return this._query(queryMethod);
  
  return null;
};

Element.prototype._query = function (queryMethod) {
  var _element = null;
  
  try{
    _element = this._context[queryMethod].call(this._context, this._selector);
  } 
  catch(e) {}
  
  return _element;
};

Element.prototype._setSelectorContext = function (newSelector) {
  
  // Reset context, selector, and type for parent to child queries
  if (this._type !== 'selector') {
    this._context = this._selector;
    this._selector = newSelector;
    this._type = whichType(newSelector);
  }
  else{
    this._selector = this._selector + ' ' + newSelector;
  }
  
  return this;
};

Element.prototype.wrap = function (_prototype_) {
  var F = function (_data) {
    this.element = element(_data);
  }
  
  F.prototype = _prototype_;
  
  return new F(this._selector);
};

function whichType (data) {
  if (typeof data !== 'string') return 'dom';
  if (regular.html.test(data)) return 'html';
  return 'selector';
}
},{"domify":3,"regular":4}],3:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // Note: when moving children, don't rely on el.children
  // being 'live' to support Polymer's broken behaviour.
  // See: https://github.com/component/domify/pull/23
  if (1 == el.children.length) {
    return el.removeChild(el.children[0]);
  }

  var fragment = document.createDocumentFragment();
  while (el.children.length) {
    fragment.appendChild(el.removeChild(el.children[0]));
  }

  return fragment;
}

},{}],4:[function(require,module,exports){
var regular = {
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
  domain: /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|3[47][0-9]{13})$/,
  ssn: /^([0-9]{3}[-]*[0-9]{2}[-]*[0-9]{4})*$/,
  slug: /^[a-z0-9-]+$/,
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  number: /^[0-9]+$/,
  basicAuth: /^\S+\:\S+$/,
  html: /<([a-z]+) *[^/]*?>/
};

module.exports = regular;
},{}]},{},[1])