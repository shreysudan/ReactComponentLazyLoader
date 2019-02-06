// @flow
export const isIntersectionObserverSupported = (): boolean => {
  return "IntersectionObserver" in window;
};
