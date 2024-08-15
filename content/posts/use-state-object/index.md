---
title: "useStateObject: A Simple, Convenient API Around useState"
date: 2024-08-15T16:34:22-07:00
draft: false
tags: [react]
---

I am loving this API for working with React state. It's a very light wrapper around useState. I call it `useStateObject`.

Here's how it looks:

```js
const state = useStateObject({
  offset: 0,
  src: 1,
  size: 200,
});
```

That's how I set it up with the initial state. I can access any of those state properties with dot syntax.

```js
state.src * state.size;
```

I get to use the following methods in my event handlers. This is how to merge another object with the state.

```js
state.merge({ src: null, offset: 0 });
```

Here I provide a whole new value to the state.

```js
state.set({ src: 2, offset: 200, size: 100 });
```

Just set one property.

```js
state.setItem("offset", 999);
```

Reset the state back to its initial value.

```js
state.reset();
```

Here's the code if you want to see what this API feels like in your own project.

```js
import { useRef, useState } from "react";

export function useStateObject(init) {
  const initialState = useRef(init).current;
  const [state, setState] = useState(init);

  return {
    ...state,
    set: setState,
    setItem: (key, value) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    merge: (newState) => {
      setState({ ...state, ...newState });
    },
    reset() {
      setState({ ...initialState });
    },
  };
}
```

...and for you TypeScripters...

```ts
import { useRef, useState } from "react";

export function useStateObject<T>(init: T) {
  const initialState = useRef(init).current;
  const [state, setState] = useState<T>(init);

  return {
    ...state,
    set: setState,
    setItem: (key: string, value: any) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    merge: (newState: Partial<T>) => {
      setState({ ...state, ...newState });
    },
    reset() {
      setState({ ...initialState });
    },
  };
}

export type StateObject<S> = S & ReturnType<typeof useStateObject>;
```

Anyone want to figure out how to type the `setItem(key, value)` method? Email me and I'll update the post.
