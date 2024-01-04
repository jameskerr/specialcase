---
title: "Partially Controlled Components: A Declarative Design Pattern in React"
date: 2023-08-01T12:00:00-0800
draft: false
description: A common distinction in React is controlled vs uncontrolled components. But the real world is not so black and white...
---

A common distinction in React is [Controlled vs Uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components) components. But the real world is not so black and white...

To summarize:

- **Uncontrolled** components manage changes within themselves, _internally_.
- **Controlled** components have their changes managed for them, from the outside, _externally_.

I recently authored a tree view React component called [react-arborist](https://github.com/brimdata/react-arborist). After working on a complex component like this I felt the absence of a necessary concept in our React community.

✨ **_Partially Controlled Components_** ✨'

You've felt it too? Let's get into this.

## Gradually Controllable Complex Components

As a library author, I want the "Getting Started " experience to be dead simple.

```jsx
<Tree initialData={myData} />
```

By default, the component takes care of everything internally: selection, drag-and-drop, and renaming. As it integrates into an app, users can take control of **only the parts they need**. Common needs are persisting the state, initializing the state, or changing the tree from elsewhere in the app.

## Declarative vs Imperative Control

There are only two ways to control a component from the outside:

1. Attaching a **Ref** _(imperative)_
2. Providing **Props** _(declarative)_

Let's look at some real world component libraries to showcase these two approaches.

## Imperative Control in react-resizable-panes

First we will examine [react-resizable-panes](https://github.com/bvaughn/react-resizable-panels), a promising new React component library by [Brian Vaughn](https://www.bvaughn.me). The Panel component is uncontrolled by default (win), and provides a ref handle to control it from the outside.

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

We can control the collapsible state from the outside by calling the `collapse()` method on the Panel's [imperative handle](https://react.dev/reference/react/useImperativeHandle).

## Declarative Control in Tanstack Table

In the React version of [tanstack-table](https://tanstack.com/table/v8), the go-to component library for everything tabular, [Tanner Linsley](https://twitter.com/tannerlinsley) allows us to partially control the state of our table by passing arguments to the [useReactTable](https://tanstack.com/table/v8/docs/adapters/react-table) hook.

His library only provides a hook and leaves rendering for us, but this is essentially passing props to a component. When the arguments to the hook change, React will re-render our table.

```jsx
const table = useReactTable({
  data,
  columns,
  state: {
    columnVisibility, // visibility value
    columnOrder, // order value
  },
  onColumnVisibilityChange: setColumnVisibility, // visibility setter
  onColumnOrderChange: setColumnOrder, // order setter
});
```

Look at that partial control! I really think he's onto something. Since the component/hook does so many things, the state is divided into logical slices. Each slice can either be controlled or uncontrolled depending on the presence of an `on[SliceName]Change` handler. I love this pattern. However, to me, its undesirable that the value and change handler are not co-located. It is also a bit verbose. But it is declarative and much more "React".

## API Inspiration from React Input Elements

Let's get back to our roots. The basic React [`<input />`](https://react.dev/reference/react-dom/components/input) element is where the concept of controlled/uncontrolled components was born. The React authors decided on this API:

- by default the input is uncontrolled
- by adding props, you opt-in to control
- The relevant prop names are `value`, `defaultValue`, and `onChange`

### 1. Uncontrolled

```jsx
<input />
```

### 2. Uncontrolled with an initial value

```jsx
<input defaultValue="hello" />
```

### 3. Controlled

```jsx
<input value={value} onChange={(e) => setValue(e.currentTarget.value)} />
```

## A Declarative Pattern for Partially Controlled Components

Let's expand on all the patterns we saw above and design a new API for partially controlled components. We'll use react-arborist as an example use case.

**Use Case 1:** A user wants control over just the tree's selection state.

```jsx
const [selection, setSelection] = useState(initial());

return (
  <Tree
    selectionState={{
      value: selection,
      onChange: (state) => setSelection(state),
    }}
  />
);
```

**Use Case 2:** They want to control the editing state as well.

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

**Use Case 3:** Provide only an initial state for which nodes are expanded/collapsed?

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

**Use Case 4:** Control all the state in a Redux store.

```jsx
const treeState = useSelector(MyApp.selectTreeState);
const dispatch = useDispatch();

return (
  <Tree
    rootState={{
      value: treeState,
      onChange: (state) => dispatch(MyApp.setTreeState(state),
    }}
  />
);
```

Each logical group of state has its own prop object for users to control. The presence of this prop indicates to the component that its state slice will be managed externally.

I like this pattern for a few reasons.

- It's declarative
- It's familiar
- Values and handlers are co-located
- It's uncontrolled by default
- It's easy to gradually take control

## What's Next?

What do you think of this design? Depending on your feedback, I may make this the API in version 4 of react-arborist.

Curious how one would implement an API like this? Keep a lookout for part two!
