---
title: Finally Understanding How Array.sort(comparator) Works
date: 2024-03-28T11:39:07-07:00
draft: false
tags: ["javascript"]
---

After 13 years of JavaScript, I finally have a way to remember how the comparator function in [Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) works.

I think the trouble is that all the examples use this shorthand syntax.

```js
array.sort((a, b) => b - a); // too hard for James
```

This is beyond confusing for me. In the past, I would just try `b - a` then try `a - b` and pick which one gave me the result I wanted. But now I have a mental model simple enough for me to remember.

First, the sole purpose of the comparator function is to answer this quesions:

> Where should "a" be placed in the new sorted array? To the left of "b" or to the right?

The arguments passed to the comparator function are usually named `a` and `b`. This makes sense to me, since the first arg comes before the second arg, and `a` comes before `b` in the English alphabet. These arguments represent two items in the array.

Now let's think about the return value. The function must return a number. Numbers exist on a number line going from left to right just like the items in an array. The negative numbers are on the left, zero is in the middle, and the positive numbers on the right.

```
-3   -2   -1   0   1   2   3
----------------------------
    a good ol' number line
```

So check it out, if your comparator function returns a _negative number_, the first argument `a` will come first, before `b`. Just like negative numbers on the number line come first!

If the function returns a _positive number_, the first argument `a` will come after `b`. The `a` item will be on the "right" side of of `b`, just like the positive numbers are on the "right" side of the number line!

# 🤯

If the function returns 0, there will be no change to the existing order of the elements. This one was pretty easy to remember.

To summarize, we just want to find out where `a` goes. Does it go to the left or right of `b`. Negative means left, positive means right. Number line. Left to right.

The "left-to-right-ness" of the number line, the items in an array, the alphabet, and the positional arguments all finally clicked for me today.

Maybe this will click for you too and you can save yourself 13 years of googling "How does array.sort(comparator) work again?".
