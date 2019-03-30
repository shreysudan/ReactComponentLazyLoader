import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { PropTypes } from 'prop-types';
import throttle from 'lodash/throttle';
import { isIntersectionObserverSupported } from './utils';

class ReactComponentLazyLoader extends React.Component {
  static defaultProps = {
    placeholder: <div />,
    threshold: 0,
  };

  static propTypes = {
    threshold: PropTypes.number,
    children: PropTypes.node,
    placeholder: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      renderLazyLoadedComponent: false,
      isIntersectionObserverAvailableinWindow: isIntersectionObserverSupported(),
    };
    this.observer = null;
    this.placeholderNode = null;
    this.handleViewportChangeEvents = throttle(
      this.handleViewportChangeEvents,
      50
    );
  }

  componentDidMount() {
    this.placeholderNode = findDOMNode(this);
    if (typeof this.placeholderNode === 'object') {
      if (this.state.isIntersectionObserverAvailableinWindow) {
        this.createObserver();
      } else {
        window.addEventListener('resize', this.handleViewportChangeEvents);
        window.addEventListener('scroll', this.handleViewportChangeEvents);
      }
    }
  }

  handleViewportChangeEvents = () => {
    const { threshold } = this.props;
    const scrollDistance = window.scrollY || window.pageYOffset;
    const scrolledFromTop = window.innerHeight + scrollDistance;
    const distanceOfElementFromTop = this.placeholderNode.getBoundingClientRect()
      .top;
    if (distanceOfElementFromTop - threshold < scrolledFromTop) {
      this.setState({ renderLazyLoadedComponent: true });
      window.removeEventListener('resize', this.handleViewportChangeEvents);
      window.removeEventListener('scroll', this.handleViewportChangeEvents);
    }
  };

  createObserver = () => {
    const { threshold } = this.props;
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.0,
    };

    this.observer = new IntersectionObserver(
      this.handleViewportChange,
      options
    );
    this.observer.observe(this.placeholderNode);
  };

  handleViewportChange = changes => {
    changes.forEach(change => {
      if (change.intersectionRatio > 0) {
        this.setState({ renderLazyLoadedComponent: true });
        this.observer.disconnect();
      }
    });
  };

  render() {
    const { children, placeholder } = this.props;
    return this.state.renderLazyLoadedComponent ? children : placeholder;
  }
}

export default ReactComponentLazyLoader;
