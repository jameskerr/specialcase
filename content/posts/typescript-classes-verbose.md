---
title: TypeScript Classes Are Giving Me Carpal Tunnel
date: 2022-12-21T10:37:00-07:00
draft: false
tags: ["typescript"]
---

Whenever a class needs a few arguments in TypeScript, I cringe because I know I'm going to need to perform a ceremony to make it happy.

Let's start with the simple case. If a Class needs two arguments, I'd do this:

```ts
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```

There is some repetition to get the types and initialization right. Fortunately, the TypeScript authors created a shorthand syntax to calm this down.

```ts
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
```

Very nice. By providing a typescript keyword `public`, `private`, `protected`, or `readonly` before the argument name, the class will make it a member variable and initialize it with the argument for you!

This is amazing but...

```ts
new GiantObjectWithManyArgs(field, table, null, null, undefined, "init", () =>
  console.log("callback"),
);
```

...it breaks down when you have more than 1 or 2 arguments. To fix this, a common pattern is to pass a single object argument.

```ts
new GiantObjectWithManyArgs({
  field: myField,
  table: myTable,
  parent: null,
  children: null,
  status: "init",
  onComplete: () => console.log("callback"),
});
```

This is so much better than positional arguments.

1. They have names!
2. The order doesn't matter!
3. The optional args can be omitted!

In JavaScript, this would be a piece of cake to setup in the constructor.

```js
class GiantObjectWithManyArgs {
  constructor(args) {
    Object.assign(this, args);
  }
}
```

Everything in the args object becomes a member of the class. But in TypeScript, the amount of code needed to make this work explodes!

This is the least verbose way I know to write it.

```ts
type Args = {
  field: zed.Field;
  table: zed.Table;
  parent: GiantObject | null;
  children: GiantObject[] | null;
  status: "init" | "complete";
  onComplete?: () => void;
};

class GiantObject {
  field: Args["field"];
  table: Args["table"];
  parent: Args["parent"];
  children: Args["children"];
  status: Args["status"];
  onComplete: Args["onComplete"];

  constructor(args: Args) {
    this.field = args.field;
    this.table = args.table;
    this.parent = args.parent;
    this.children = args.children;
    this.status = args.status;
    this.onComplete = args.onComplete;
  }
}
```

I've got blisters on my fingers!

TypeScript authors...you saw the the need for positional argument shorthand. I'm sure you see the need for object argument shorthand as well.

I'm no language designer so here is my blind stab in the dark for syntax ideas.

```ts
type Args = {
  field: zed.Field
  table: zed.Table
  parent: GiantObject | null
  children: GiantObject[] | null
  status: "init" | "complete"
  onComplete?: () => void
}

// Not Real TypeScript
class GiantObject {
  constructor(public assign args: Args) {}

  // Aww, it's probably hard to specifiy
  // some as a private and others as public...
}
// Or mabye
class GiantObjects assigns Args {
  constructor(args: Args) {
    for (let key in args) this[key] = args[key]
  }
}
```

## Workaround

My workaround for this is to assign the whole object to a member variable called "args".

```ts
type Args = {
  // ...
};

class GiantObject {
  args: Args;

  constructor(private args: Args) {}
}
```

Then I have to make getters for each of the pieces I need. It's not a bad way to go, but I'm coding around something because the tooling makes the preferred style difficult.

Object arguments are so much better than positional arguments, but the boilerplate in TypeScript compared to plain JavaScript makes them almost not worth it.
