export const isIntersectionObserverSupported = () => {
  return "IntersectionObserver" in window;
};
