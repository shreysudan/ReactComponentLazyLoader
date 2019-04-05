# [WIP] React Component Lazy Loader

A simple React component, which lazily loads it's children based on viewport visibility. Uses [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) for increased performance, if browser supports it, otherwise fallbacks to an event based visibility check system to check for position of component with respect to viewport.

Handles both horizontal as well as vertical LazyLoading of elements.

  

### Installation

  

```

npm install react-component-lazy-loader

```

  

### Usage

Simply wrap the component which you want to lazily load with ReactComponentLazyLoader and based on the props given, the component will start rendering it's children only when they're visible in viewport.

  

```javascript

import  ReactComponentLazyLoader  from  'react-component-lazy-loader';

...

...

  

<ReactComponentLazyLoader>

    <YourComponent>

</ReactComponentLazyLoader>

```

  

# Props

  

### thresholdY

A positive value for thresholdY(default: 0) makes components load sooner, when scrolling vertically in the viewport.
Similarly, a negative value for thresholdY will make components load later.

  

```javascript

<ReactComponentLazyLoader  thresholdX={200}>

    <img src="...">

</ReactComponentLazyLoader>

```

In above example, the <img> will render when the <img> component is 200 pixels below the fold. With no threshold value provided, default value is used, in which case the component will get rendered only when it comes above the fold/gets visible in the viewport.


### thresholdX

A positive value for thresholdX(default: 0) makes components load sooner, when scrolling horizontally.
Similar to thresholdY, a negative value for thresholdY will make components load later.

  

```javascript

<ReactComponentLazyLoader  thresholdY={200}>

    <img src="...">

</ReactComponentLazyLoader>

```

  
### placeholder

Placeholder is rendered until the component's thresholdX/thresholdY value plus viewport size is not reached. Normally which means placeholder gets rendered till the component is above the fold.

  

Placeholder can be anything - a simple <img> with a default image or any other valid React custom component. Default value for placeholder is any empty <div> i.e, an empty div will get rendered as a placeholder, until the condition to render the children is not met. 

  

```javascript

<ReactComponentLazyLoader  thresholdY={200}  placeholder={<img  src='...'/>}>

    <img>

</ReactComponentLazyLoader>

```

### noLazyHorizontalScroll

Prop to prevent lazyloading of components when doing horizontal scroll. Default value for this is false.


### callback

A callback function which when passed, will be called once the lazyloading condition is met and actual component gets rendered on screen. 

```javascript

<ReactComponentLazyLoader  
   thresholdY={200}  
   placeholder={<img  src='...'/>}
   callback={() => {// Do something}}>
   
    <img>

</ReactComponentLazyLoader>

```

### wrapperID

Typically, vertical scroll is implemented with respect to a parent container and not the body of the document, hence in order to lazyload components on vertical scroll, an id would need to be set on the parent element, with respect to which vertical scroll happens. 
This id would need to be passed as wrapperID to the ReactComponentLazyLoader, for vertical lazyloading to work.

