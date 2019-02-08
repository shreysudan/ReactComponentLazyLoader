# [WIP] React Component Lazy Loader
A simple React component, which lazily loads it's children based on viewport visibilty. Uses [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) for increased performance, if browser supports it, otherwise fallbacks to an event based visibility check system to check for position of component with respect to viewport.

### Installation

```
    npm install react-component-lazy-loader
```

### Usage
Simply wrap the component which you want to lazily load the component with ReactComponentLazyLoader and based on the props given, the component will start rendering only when it's visible in viewport.

```javascript
    import ReactComponentLazyLoader from 'react-component-lazy-loader';
    ...
    ...

    <ReactComponentLazyLoader>
        <YourComponent>
    </ReactComponentLazyLoader>
```

# Props

### threshold
A positive value for threshold(default it 0) makes image load sooner. 

```javascript
    <ReactComponentLazyLoader threshold={200}>
        <img>
    </ReactComponentLazyLoader>
```
In above example, the <img> will render when the <img> component is 200 pixels below the fold. With no threshold value provided, default value is used, in which case the component will get rendered only when it comes above the fold or gets visible in the viewport

### placeholder
Placeholder is rendered until the component's threshold value is not reached. Normally which means placeholder gets rendered till the component is above the fold. 

Placedholder can be anything - a simple <img> or any other valid React custom component. Default value for placeholder is any empty <div>

```javascript
    <ReactComponentLazyLoader threshold={200} placeholder={<img src='example'>}>
        <img>
    </ReactComponentLazyLoader>
```


