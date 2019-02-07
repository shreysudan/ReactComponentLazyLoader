"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isIntersectionObserverSupported = exports.isIntersectionObserverSupported = function isIntersectionObserverSupported() {
  return "IntersectionObserver" in window;
};