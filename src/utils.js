export const isIntersectionObserverSupported = () => {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
};

export const currentScrollPosition = () => {
  return {
    scrollX: window.scrollX || window.pageXOffset,
    scrollY: window.scrollY || window.pageYOffset,
  };
};
