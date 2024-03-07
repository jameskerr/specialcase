---
title: "Transitions All Settled"
date: 2024-03-05T20:26:00-08:00
draft: false
description: A function that waits for CSS transitions to settle.
tags: ["javascript"]
---

I just published a JavaScript library called [transitions-all-settled](https://github.com/jameskerr/transitions-all-settled) that allows you to wait for CSS transitions to settle before you do something.

The package exports a single function that accepts an HTML node and returns a promise. The promise resolves when all CSS transitions on the HTML node and its children have settled.

```js
import { transitionsAllSettled } from "transitions-all-settled";

await transitionsAllSettled(node);
```

The term "settled" means that if a node received a `transitionstart` event, it
also received a `transitionend` or `transitioncancel` event.

This is useful for exit animations to wait for all CSS transitions to settle before removing the node from the DOM.

Here is a demo. Click any square.

<div id="canvas" class="flow">
    <div class="square first"></div>
    <div class="square second"></div>
    <div class="square third"></div>
</div>

Here's the code that makes that happen. Here's the HTML.

```html
<div id="canvas" class="flow">
  <div class="square first"></div>
  <div class="square second"></div>
  <div class="square third"></div>
</div>
```

The CSS.

```css
.square {
  width: var(--step-3);
  height: var(--step-3);
  background-color: var(--color-text);
  transition-duration: 1s;
}
.clicked .square {
  background-color: var(--color-primary);
  transform: translateX(100%) rotate(90deg);
}
.first {
  transition-delay: 0;
}
.second {
  transition-delay: 500ms;
}
.third {
  transition-delay: 1000ms;
}
```

Here's the JavaScript.

```js
import { transitionsAllSettled } from "transitions-all-settled";

const canvas = document.getElementById("canvas");

canvas.addEventListener("click", async () => {
  canvas.classList.toggle("clicked");
  await transitionsAllSettled(canvas);
  alert("Transitions All Settled");
});
```

The package is very
small. Take a look at the source to see exactly how it works.

GitHub: [jameskerr/transitions-all-settled](https://github.com/jameskerr/transitions-all-settled)

<style>
  .square {
    width: var(--step-3);
    height: var(--step-3);
    background-color: var(--color-text);
    transition-duration: 1s;
  }
  .clicked .square {
    background-color: var(--color-primary);
    transform: translateX(100%) rotate(90deg);
  }
  .first {
    transition-delay: 0;
  }
  .second {
    transition-delay: 500ms;
  }
  .third {
    transition-delay: 1000ms;
  }
</style>

<script type="module">
  import { transitionsAllSettled } from "https://esm.run/transitions-all-settled@0.2.0";

  const canvas = document.getElementById("canvas");
  canvas.addEventListener("click", async () => {
    canvas.classList.toggle("clicked");
    await transitionsAllSettled(canvas);
    alert("Transitions All Settled");
  });
</script>
