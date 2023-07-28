---
title: Partially Controlled React Components
date: 2023-07-28T12:00:00-0800
draft: false
description: A common distinction in React is controlled vs uncontrolled components. But the real world is not so black and white...
---

A common distinction in React is [Controlled vs Uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components) components. To summarize:

- **Uncontrolled** components manage changes within themselves, _internally_.
- **Controlled** components have their changes managed for them, from the outside, _externally_.

But the real world is not so black and white...

I am the author of a tree view React component called [react-arborist](https://github.com/brimdata/react-arborist). After working on a complex component like this I felt the absence of a necessary concept in our React communty.

✨ **_Partially Controlled Components_** ✨'

You've felt it too? Let's get into this.

## Uncontrolled By Default

As a library author, I want the "Getting Started " experience to be dead simple.

```jsx
<Tree initialData={myData} />
```

By default, the component takes care of everything internally: selection, drag-and-drop, renaming, etc. As it integrates into an app, I want users to take control of the parts they need. Common needs are persisting the state, initializing the state, or changing the tree from elsewhere in the app. I want to allow partial control of the tree.

## Only Two Ways to Control a React Component

There are only two ways to control a component from the outside:

1. Attaching a **Ref** _(imparative)_
2. Providing **Props** _(declarative)_

Let's look at some real world component libraries to showcase these two approaches.

### Imperative Control with a Ref

First we will examine [react-resiable-panes](https://github.com/bvaughn/react-resizable-panels), a promising new React component library by [Brian Vaughn](https://www.bvaughn.me). The Panel component is uncontrolled by default (win), but provides a ref handle to control it from the outside.

```jsx
import {Panel} from "react-resizable-panels";


function MyApp() {
	const ref = useRef(null);

  const onClick = () => {
		ref.current?.collapse();
  };

  return (
    ...
    <Panel collapsible ref={ref}>
      ...
    </Panel>
    ...
    <button onClick={onClick}>Collapse</button>
	)
}
```

In the code above we can control the collapsable state by calling the `collapse()` method provided by the Panel's [imperative handle](https://react.dev/reference/react/useImperativeHandle) in our own click handler. Brian's code is an inspiration to me and I've modeled much of react-arborist from his libraries. But there is room to improve.

### Declarative Control with Props

Alternatively in [react-table](https://tanstack.com/table/v8), the go-to component library for everything tabular, [Tanner Linsley](https://twitter.com/tannerlinsley) allows us to partially control the state of our table by passing arguments to the [useReactTable](https://tanstack.com/table/v8/docs/adapters/react-table) hook. His library only provides a hook and lets us render everything ourselves. This is essentially like passing props to a component.

```jsx
const table = useReactTable({
  data,
  columns,
  state: {
    columnVisibility, // visiblity value
    columnOrder, // order value
  },
  onColumnVisibilityChange: setColumnVisibility, // visibility setter
  onColumnOrderChange: setColumnOrder, // order setter
});
```

Take a look at that partial control! I really think he's onto something. Since the component/hook does so many things, the state is divided into logical slices. Each slice can either be controlled or uncontrolled depending on the presence of an `on[SliceName]Change` handler. I love this pattern. However, to me, its undesirable that the value and change handler are not co-located. It is also a bit verbose. But it is declarative and much more "React".

### Inspriation from React Input Elements

Let's get back to our roots. The basic React [`<input />`](https://react.dev/reference/react-dom/components/input) element is where the concept of controlled/uncontrolled components was born. The React authors decided on this API:

- by default the input is uncontrolled
- by adding props, you opt-in to control
- The relevant prop names are `value`, `defaultValue`, and `onChange`

**Uncontrolled**

```jsx
<input />
```

**Uncontrolled with an initial value**

```jsx
<input defaultValue="hello" />
```

**Controlled**

```jsx
<input value={value} onChange={(e) => setValue(e.currentTarget.value)} />
```

See where this is going?

### A Pattern for Partially Controlled Components

Let's expand on all the patterns we saw above and design a new API for partially controlled components. We'll use react-arborist as an example use case.

What if users want control over just the tree's selection state?

```jsx
const [selection, setSelection] = useState(initial());
// or dispatch/select from Redux

return (
  <Tree
    selectionState={{
      value: selection,
      onChange: (state) => setSelection(state),
    }}
  />
);
```

The editing state as well?

```jsx
<Tree
  selectionState={{
    value: selection,
    onChange: (state) => setSelection(state)
  }}
  editingState={{
    value: editing
    onChange: (state) => setEditing(state)
  }}
/>
```

Want to provide an initial state for which nodes are expanded/collapsed?

```jsx
<Tree
  selectionState={{
    value: selection,
    onChange: (state) => setSelection(state)
  }}
  editingState={{
    value: editing
    onChange: (state) => setEditing(state)
  }}
  expandedState={{
    defaultValue: expanded
  }}
/>
```

Each logical group of state has it's own prop object for user's to control. The presence of this prop indicates to the component that its state slice will be managed externally.

I like this pattern for a few reasons.

- It's declarative
- It's familiar
- Values and handlers are co-located
- It's uncontrolled by default
- It's easy to take control

## What's Next?

What do you think of this design? Depending on your feedback, I may just make this the API in version 4 of react-arborist.

And finally, how would you implement an API like the one above? Keep a lookout for part 2 when I'll go into that.

Thanks for reading this far!
