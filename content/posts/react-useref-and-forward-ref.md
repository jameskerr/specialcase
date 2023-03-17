---
title: "How to useRef and forwardRef in React"
date: 2022-05-03T00:00:00-07:00
draft: false
description: The short answer is merge the refs into a single ref function. If that's not immediatly obvious, you're like me.
---

What do I do when my component uses a ref internally but also needs to forward a ref from its parent? The short answer is merge the refs into a single ref function. If what that means is not immediatly obvious, you're like me. Read on.

## What is a ref?

Look at what get's returned from _useRef_.

```js
const ref = useRef()
console.log(ref)

/* prints */
{current: undefined}
```

This ref is an object with one property _current_ that can be set to whatever you want.

What happens when I pass it to an HTML element?

```jsx
<button ref={ref} />
```

For years I just thought this was magic, but today I grepped "ref" in my `node_modules/react-dom` folder and it's not complicated. After react-dom creates the HTML button instance, it will attach the ref like so:

```js
if (typeof ref === 'function') {
  	ref(instanceToUse)
  } else {
  	ref.current = instanceToUse
  }
}
```

The _ref_ prop will only accept three things:

1. a function
2. a plain object with a single _current_ property
3. null

This means these two lines result in the same thing.

```jsx
<button ref={ref} />
<button ref={(instance) => ref.current = instance} />
```

## What about forwardRef?

When in doubt, console.log it out.

```jsx
const MyButton = forwardRef(function(props, ref) {
  console.log(ref)
  ...
})
```

What gets printed depends on the ref value given to the component. If you create that _MyButton_ component without passing it a ref, you'll see `null` printed to the console.

```jsx
<MyButton /> // with no ref

/* prints */
null;
```

Now let's try it with a ref from _useRef_.

```jsx
const ref = useRef()
<MyButton ref={ref} />

/* prints */
{current: undefined}
```

Ok, this is starting to make sense. Whatever you pass as the _ref_ prop to the _MyButton_ component will be the same as second argument in the _forwardRef_ function.

```jsx
<MyButton ref={ref} /> // this ref is the same as...
forwardRef(function(props, ref) {}) // ...this ref
```

The name "_forwardRef_" is starting to make a lot of sense. Let's test this out by passing a function as the _ref_ property.

```jsx
const func = (node) => console.log("Hi")
<MyButton ref={func} />

/* prints */
'(node) => console.log("Hi")'
/* the string representation of the function */

```

## Merging Two Refs

So to deliver on the promise of this blog's title, here's how we can have _useRef_ and _forwardRef_ in the same function component.

```jsx
const MyButton = forwardRef(function(props, forwardedRef) {
  const localRef = useRef()

  return (
    <button
      ref={(instance) => {
        // first we set the local ref
        localRef.current = instance

        // then we handle the forwarded ref
        // it can be a function, an object, or null
        if (typeof forwardedRef === "function") {
          forwardedRef(instance)
        } else if (typeof forwardedRef === "object") {
          forwardedRef.current = instance
        }
      }}
    />
  );
});
```

This uses a function to properly set both the local and the forwarded refs.

At this point, you probably can't help yourself from writing this _mergeRefs_ function.

```js
function mergeRefs(...refs) {
  return (instance) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance)
      } else if (ref != null) {
        ref.current = instance
      }
    })
  }
}
```

To be used like this:

```jsx
const MyButton = forwardRef(function(props, forwardedRef) {
  const localRef = useRef()

  return <button ref={mergeRefs(localRef, forwardedRef)} />
});
```

Turns out, [Greg Bergé](https://twitter.com/neoziro) has created a utility that does just this called [react-merge-refs](https://github.com/gregberge/react-merge-refs). That _mergeRefs_ function above is almost copied strait from his code. Thanks Greg.

So that's how you do it.
