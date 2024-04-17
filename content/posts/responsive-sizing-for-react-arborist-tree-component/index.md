---
title: "Responsive Sizing for React Arborist Tree Component"
date: 2024-04-17T10:00:47-07:00
draft: false
---

Many people ask me about how to dynamically set the width and height of the Tree component based on its parent using [react-arborist](https://github.com/brimdata/react-arborist).

```jsx
<TreeView width={300} height={500} />
// How do I make these responsive?
```

The component only accepts fixed pixels for the height and width because it virtualizes the rows. It uses the tree height, scroll position, and row height to render only the nodes that are visible to the user. Nodes are mounted as soon as they are scrolled into view and unmounted when they overflow.

This is great, but I almost always want my tree to be the same width and height of its parent, not a fixed size.

Here's how to do it.

Let's get the HTML marked up so that the parent will grow and shrink as the window resizes.

```jsx
<div className="sidebar">
  <div className="tree-parent">
    <TreeView />
  </div>
</div>
```

We will first style the `.sidebar` class.

```css
.sidebar {
  height: 100vh;
  width: 300px;

  display: flex;
  flex-direction: column;
}
```

We make this element as high as the viewport and 300px wide to make it look like a sidebar. Then we make it a flex parent setting the flex-direction to "column" so the children stack vertically.

Next is the `.tree-parent` class.

```css
.tree-parent {
  flex-grow: 1;
  min-block-size: 0;
}
```

Here we make the element grow to fill all available empty space and set the min-block-size to zero.

{{< note >}}
I always forget about the min-block-size (min-height). If you omit this style, growing the parent will work fine, but shrinking it will not shrink the tree. The reason is the default value for min-height is "auto". The browser will consider how tall the children are to determine the height of the parent. The issue is we want the the child (tree) to set its height to whatever the parent is. It's like a co-dependent DOM relationship. Setting the minimum height to zero tells the element not to concern itself with its children's height. Just grow and shrink as if you have no children.
{{< /note >}}

To summarize, we tell this element to grow to fill all available space, and always shrink if your parent gets smaller. Don't worry about what your children are doing.

Now we need to get the size of the `.tree-parent` element and pass those pixels to the `<TreeView />` component, while responding to resizing. For this we reach for the [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) DOM API.

```jsx
import { TreeView } from "react-arborist";
import useResizeObserver from "use-resize-observer";

function Sidebar() {
  const { ref, width, height } = useResizeObserver();

  return (
    <div className="sidebar">
      <div className="tree-parent" ref={ref}>
        <TreeView width={width} height={height} />
      </div>
    </div>
  );
}
```

We could write the hook from scratch, but it will probably end up looking exactly like this small, well-written library [use-resize-observer](https://github.com/ZeeCoder/use-resize-observer).

You attach the ref to the `.tree-parent` and now you have its width and height in pixels. Those variables will be updated every time that element is resized in the DOM and the component will re-render with updated width and height values.

This is exactly where we want to be. We can pass those dimensions to the `<TreeView />` component and it will always be the same size as its parent.
