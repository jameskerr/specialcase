---
title: "Against Single Element React Components"
date: 2023-11-06T15:51:23-08:00
draft: false
description: Don't wrap single elements in React components just to style them.
tags: ["react", "javascript"]
---

{{< initial-cap >}} It's not uncommon {{< /initial-cap >}} to see this type of single element React component.

```jsx
function Title({ children, ...rest }) {
  return <h1 {...rest}>{children}</h1>;
}
```

If you use a library like [styled-components](https://styled-components.com/), you're very much encouraged to write in this way.

```jsx
const Nav = styled.nav``;
const List = styled.ul``;
const Item = styled.li``;
const Link = styled.a``;

function MyApp() {
  return (
    <Nav>
      <List>
        <Item>
          <Link href="/home">Home</Link>
        </Item>
        <Item>
          <Link href="/blog">Blog</Link>
        </Item>
        <Item>
          <Link href="/about">About</Link>
        </Item>
      </List>
    </Nav>
  );
}
```

## Problems with Single Element Components

I have written my share of the code above. I won't anymore.

Take a look at that `<Link />` component. What props does it take? Where is the documentation for it? Well, just scroll up and see that it's actually just an anchor tag. What if it's exported from another file? Ok, just open up the file. Now what about every other component written this way? I'm going to be scrolling and opening all sorts of files to see what these tiny components do until I memorize them for my specific app.

Now take a look at this code:

```html
<a></a>
```

No scrolling needed. No lookups needed. We all know _exactly_ what an anchor tag does. And if we don't remember something, there are loads of docs on this and every other HTML element.

We've all put countless hours in learning HTML. Hiding the underlying element with a tiny React component throws all that knowledge away.

## Components that Slightly Change the API

To make this worse, some components slightly change the established HTML API. I see it often with buttons.

We all know this API.

```html
<button type="submit">Click Me</button>
```

But many times I've wrapped this up into something like:

```jsx
<Button isPrimary text="Click Me" />
```

Now everyone needs to memorize or lookup the new API whenever they need a button. Hard.

## The Solution is HTML with a Class Attribute

When we use the single element component pattern, we give up the well-known HTML APIs to encapsulate some visual styles. Not a fair trade. Especially when HTML has a built-in, stone-age solution for encapsulating visual styles: **the class attribute**.

```jsx
import styles from "./app.module.css";

function MyApp() {
  return (
    <nav className={styles.mainNav}>
      <li>
        <a href="/home">Home</a>
      </li>
      <li>
        <a href="/blog">Blog</a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
    </nav>
  );
}
```

Nobody is going to wonder what's going on here ☝️.

## Conclusion

The leaf nodes of our component trees should be full of good 'ol HTML because it is universally known and documented. Don't throw all that out just to wrap up a visual style.
