"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactDom = require("react-dom");

var _throttle = require("lodash/throttle");

var _throttle2 = _interopRequireDefault(_throttle);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactLazyLoader = function (_React$Component) {
  _inherits(ReactLazyLoader, _React$Component);

  function ReactLazyLoader(props) {
    _classCallCheck(this, ReactLazyLoader);

    var _this = _possibleConstructorReturn(this, (ReactLazyLoader.__proto__ || Object.getPrototypeOf(ReactLazyLoader)).call(this, props));

    _this.handleViewportChangeEvents = function () {
      var threshold = _this.props.threshold;

      var scrollDistance = window.scrollY || window.pageYOffset;
      var scrolledFromTop = window.innerHeight + scrollDistance;
      var distanceOfElementFromTop = _this.placeholderNode.getBoundingClientRect().top;
      if (distanceOfElementFromTop - threshold < scrolledFromTop) {
        _this.setState({ renderLazyLoadedComponent: true });
        window.removeEventListener("resize", _this.handleViewportChangeEvents);
        window.removeEventListener("scroll", _this.handleViewportChangeEvents);
      }
    };

    _this.createObserver = function () {
      var threshold = _this.props.threshold;

      var options = {
        root: null,
        rootMargin: threshold + "px",
        threshold: 0.0
      };

      _this.observer = new IntersectionObserver(_this.handleViewportChange, options);
      _this.observer.observe(_this.placeholderNode);
    };

    _this.handleViewportChange = function (changes) {
      changes.forEach(function (change) {
        if (change.intersectionRatio > 0) {
          _this.setState({ renderLazyLoadedComponent: true });
          _this.observer.disconnect();
        }
      });
    };

    _this.state = {
      renderLazyLoadedComponent: false,
      isIntersectionObserverAvailableinWindow: (0, _utils.isIntersectionObserverSupported)()
    };
    _this.observer = null;
    _this.placeholderNode = null;
    _this.handleViewportChangeEvents = (0, _throttle2.default)(_this.handleViewportChangeEvents, 50);
    return _this;
  }

  _createClass(ReactLazyLoader, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.placeholderNode = (0, _reactDom.findDOMNode)(this);
      if (_typeof(this.placeholderNode) === "object") {
        if (this.state.isIntersectionObserverAvailableinWindow) {
          this.createObserver();
        } else {
          window.addEventListener("resize", this.handleViewportChangeEvents);
          window.addEventListener("scroll", this.handleViewportChangeEvents);
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          children = _props.children,
          placeholder = _props.placeholder;

      return this.state.renderLazyLoadedComponent ? children : placeholder;
    }
  }]);

  return ReactLazyLoader;
}(React.Component);

ReactLazyLoader.defaultProps = {
  placeholder: React.createElement("div", null),
  threshold: 0
};
exports.default = ReactLazyLoader;