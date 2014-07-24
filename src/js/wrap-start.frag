// wrap-start.frag.js
(function (global, factory) {
  if (typeof define === 'function') {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    global.OnionEditor = factory();
  }
}(this, function () {