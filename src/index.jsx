import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { PropTypes } from 'prop-types';
import throttle from 'lodash.throttle';
import get from 'lodash.get';
import {
  isIntersectionObserverSupported,
  currentScrollPosition,
} from './utils';

class ReactComponentLazyLoader extends React.Component {
  static defaultProps = {
    placeholder: <div />,
    thresholdX: 0,
    thresholdY: 0,
    wrapperID: null,
    callback: null,
    noLazyHorizontalScroll: false,
    throttleWait: 75,
  };

  static propTypes = {
    callback: PropTypes.func,
    children: PropTypes.node.isRequired,
    noLazyHorizontalScroll: PropTypes.bool,
    placeholder: PropTypes.node,
    thresholdX: PropTypes.number,
    thresholdY: PropTypes.number,
    throttleWait: PropTypes.number,
    wrapperID: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      renderLazyLoadedComponent: false,
      isIntersectionObserverAvailableinWindow: isIntersectionObserverSupported(),
      callbackCalled: false,
      distanceOfElementFromTop: undefined,
      distanceOfElementFromLeft: undefined,
    };
    this.observer = null;
    this.placeholderNode = null;
    const { throttleWait } = this.props;
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.handleWrapperScroll = this.handleWrapperScroll.bind(this);
    this.handleWrapperScroll = throttle(this.handleWrapperScroll, throttleWait);
    this.addEventListeners = this.addEventListeners.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
    this.handleViewportChangeEvents = this.handleViewportChangeEvents.bind(
      this
    );
    this.handleViewportChangeEvents = throttle(
      this.handleViewportChangeEvents,
      throttleWait
    );
    this.horizontalEventAdded = false;
    this.forcefulHorizontalScroll = false;
  }

  componentDidMount() {
    const { isIntersectionObserverAvailableinWindow } = this.state;
    this.placeholderNode = findDOMNode(this);
    if (typeof this.placeholderNode === 'object') {
      this.setPlaceholderNodePosition();
      if (isIntersectionObserverAvailableinWindow) {
        this.createObserver();
      } else {
        this.addEventListeners();
      }
    }
  }

  componentWillUnmount() {
    const { isIntersectionObserverAvailableinWindow } = this.state;
    if (isIntersectionObserverAvailableinWindow) {
      this.observer.disconnect();
    } else {
      window.removeEventListener('resize', this.handleViewportChangeEvents);
      window.removeEventListener('scroll', this.handleViewportChangeEvents);
    }
  }

  setPlaceholderNodePosition = () => {
    const elementPos = this.placeholderNode.getBoundingClientRect();
    this.setState({
      distanceOfElementFromTop: elementPos.top,
      distanceOfElementFromLeft: elementPos.left,
    });
  };

  handleViewportChangeEvents = () => {
    const { noLazyHorizontalScroll, wrapperID } = this.props;
    if (noLazyHorizontalScroll && this.loadOnVerticalScroll()) {
      this.setState({ renderLazyLoadedComponent: true });
      this.removeEventListeners();
    } else if (wrapperID) {
      const wrapperNode = document.getElementById(`${wrapperID}`);
      if (this.loadOnVerticalScroll() && this.loadOnHorizontalScroll()) {
        this.setState({ renderLazyLoadedComponent: true });
        this.removeEventListeners(wrapperNode);
      }
      if (!this.horizontalEventAdded) {
        wrapperNode.addEventListener('scroll', this.handleWrapperScroll);
        wrapperNode.addEventListener('resize', this.handleWrapperScroll);
        this.horizontalEventAdded = true;
      }
    } else if (this.loadOnVerticalScroll() && this.loadOnHorizontalScroll()) {
      this.setState({ renderLazyLoadedComponent: true });
      this.removeEventListeners();
    }
  };

  handleWrapperScroll = () => {
    const { wrapperID } = this.props;
    const { distanceOfElementFromLeft } = this.state;
    const wrapperNode = document.getElementById(`${wrapperID}`);
    const { scrollLeft } = wrapperNode;
    const loadOnHorizontalScroll =
      distanceOfElementFromLeft < window.innerWidth + scrollLeft;
    if (this.loadOnVerticalScroll() && loadOnHorizontalScroll) {
      this.setState({ renderLazyLoadedComponent: true });
      this.removeEventListeners(wrapperNode);
    }
  };

  addEventListeners = () => {
    window.addEventListener('resize', this.handleViewportChangeEvents);
    window.addEventListener('scroll', this.handleViewportChangeEvents);
  };

  removeEventListeners = wrapperNode => {
    window.removeEventListener('resize', this.handleViewportChangeEvents);
    window.removeEventListener('scroll', this.handleViewportChangeEvents);
    if (wrapperNode) {
      wrapperNode.removeEventListener('scroll', this.handleWrapperScroll);
      wrapperNode.removeEventListener('resize', this.handleWrapperScroll);
    }
  };

  loadOnVerticalScroll = () => {
    const { distanceOfElementFromTop } = this.state;
    const { thresholdY } = this.props;
    const scrollYDistance = currentScrollPosition().scrollY;
    const scrolledFromTop = window.innerHeight + scrollYDistance;
    return distanceOfElementFromTop - thresholdY < scrolledFromTop;
  };

  loadOnHorizontalScroll = () => {
    const { distanceOfElementFromLeft } = this.state;
    const { thresholdX } = this.props;
    const scrollXDistance = currentScrollPosition().scrollX;
    const scrolledFromLeft = window.innerWidth + scrollXDistance;
    return (
      distanceOfElementFromLeft - thresholdX < scrolledFromLeft ||
      distanceOfElementFromLeft < window.innerWidth
    );
  };

  createObserver = () => {
    const { thresholdX, thresholdY } = this.props;
    const options = {
      root: null,
      rootMargin: `0px ${thresholdX}px ${thresholdY}px 0px`,
      threshold: 0.0,
    };

    this.observer = new IntersectionObserver(
      this.handleViewportChange,
      options
    );
    this.observer.observe(this.placeholderNode);
  };

  handleViewportChange = changes => {
    const { noLazyHorizontalScroll } = this.props;
    changes.forEach(change => {
      if (noLazyHorizontalScroll) {
        if (change.intersectionRatio > 0) {
          this.setState({ renderLazyLoadedComponent: true });
          this.observer.disconnect();
        }
      } else {
        const scrollXDistance = currentScrollPosition().scrollX;
        const scrollYDistance = currentScrollPosition().scrollY;
        const scrolledFromTop =
          get(change, 'rootBounds.height', 0) + scrollYDistance;
        const scrolledFromLeft =
          get(change, 'rootBounds.width', 0) + scrollXDistance;
        const distanceOfElementFromTop = get(
          change,
          'boundingClientRect.top',
          0
        );
        const distanceOfElementFromLeft = get(
          change,
          'boundingClientRect.left',
          0
        );
        if (
          distanceOfElementFromTop < scrolledFromTop &&
          distanceOfElementFromLeft < scrolledFromLeft
        ) {
          this.setState({ renderLazyLoadedComponent: true });
          this.observer.disconnect();
        }
      }
    });
  };

  callCallback = () => {
    const { callback } = this.props;
    const { callbackCalled } = this.state;
    if (!callbackCalled && typeof callback === 'function') {
      callback();
      this.setState({ callbackCalled: true });
    }
  };

  render() {
    const { children, placeholder } = this.props;
    const { renderLazyLoadedComponent } = this.state;
    if (renderLazyLoadedComponent) {
      return (
        <React.Fragment>
          {children}
          {this.callCallback()}
        </React.Fragment>
      );
    }
    return placeholder;
  }
}

export default ReactComponentLazyLoader;
