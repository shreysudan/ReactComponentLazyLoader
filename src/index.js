import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { PropTypes } from 'prop-types';
import throttle from 'lodash/throttle';
import pathOr from 'lodash/fp/pathOr';
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
  };

  static propTypes = {
    thresholdX: PropTypes.number,
    thresholdY: PropTypes.number,
    children: PropTypes.node.isRequired,
    placeholder: PropTypes.node,
    noLazyHorizontalScroll: PropTypes.bool,
    wrapperID: PropTypes.string,
    callback: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      renderLazyLoadedComponent: false,
      isIntersectionObserverAvailableinWindow: isIntersectionObserverSupported(),
      callbackCalled: false,
      distanceOfElementFromTop: 0,
      distanceOfElementFromLeft: 0,
    };
    this.observer = null;
    this.placeholderNode = null;
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.handleWrapperScroll = this.handleWrapperScroll.bind(this);
    this.handleWrapperScroll = throttle(this.handleWrapperScroll, 75);
    this.addEventListeners = this.addEventListeners.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
    this.handleViewportChangeEvents = this.handleViewportChangeEvents.bind(
      this
    );
    this.handleViewportChangeEvents = throttle(
      this.handleViewportChangeEvents,
      75
    );
    this.horizontalEventAdded = false;
    this.forcefulHorizontalScroll = false;
  }

  componentDidMount() {
    this.placeholderNode = findDOMNode(this);
    if (typeof this.placeholderNode === 'object') {
      this.setPlaceholderNodePosition();
      if (this.state.isIntersectionObserverAvailableinWindow) {
        this.createObserver();
      } else {
        this.addEventListeners();
      }
    }
  }

  componentWillUnmount() {
    if (this.state.isIntersectionObserverAvailableinWindow) {
      this.observer.observe(this.placeholderNode);
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
      if (!this.horizontalEventAdded) {
        wrapperNode.addEventListener('scroll', this.handleWrapperScroll);
        this.horizontalEventAdded = true;
      }
      if (this.loadOnVerticalScroll() && !this.forcefulHorizontalScroll) {
        wrapperNode.scrollLeft = 1;
        this.forcefulHorizontalScroll = true;
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
    const scrollLeft = wrapperNode.scrollLeft;
    const loadOnHorizontalScroll =
      distanceOfElementFromLeft < window.innerWidth + scrollLeft;
    if (this.loadOnVerticalScroll() && loadOnHorizontalScroll) {
      this.setState({ renderLazyLoadedComponent: true });
      this.removeEventListeners();
      wrapperNode.removeEventListener('scroll', this.handleWrapperScroll);
    }
  };

  addEventListeners = () => {
    window.addEventListener('resize', this.handleViewportChangeEvents);
    window.addEventListener('scroll', this.handleViewportChangeEvents);
  };

  removeEventListeners = () => {
    window.removeEventListener('resize', this.handleViewportChangeEvents);
    window.removeEventListener('scroll', this.handleViewportChangeEvents);
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
    return distanceOfElementFromLeft - thresholdX < scrolledFromLeft;
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
          pathOr(0, 'rootBounds.height', change) + scrollYDistance;
        const scrolledFromLeft =
          pathOr(0, 'rootBounds.width', change) + scrollXDistance;
        const distanceOfElementFromTop = pathOr(
          0,
          'boundingClientRect.top',
          change
        );
        const distanceOfElementFromLeft = pathOr(
          0,
          'boundingClientRect.left',
          change
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
