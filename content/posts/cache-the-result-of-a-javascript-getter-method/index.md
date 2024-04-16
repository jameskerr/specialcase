---
title: "Cache the Result of a Javascript Getter Method"
date: 2024-04-16T12:49:54-07:00
draft: false
tags: ["javascript"]
---

My first programming language was Ruby. Well, it was actually Microsoft Excel, then VBA, then C# for a university class, then Ruby.

Ruby's syntax is designed for developer happiness. What a wonderful goal. In Ruby, you don't need to add parenthesis to method calls if there are no arguments.

```ruby
class FSEntry
  def stat
    File.stat(path)
  end
end

# And you can call it like this
entry = Entry.new
entry.stat # no parens!
```

However, when I don't see parens it's not obvious whether this is a cheap or expensive operation. In this case, we are hitting the file system each time we call it.

So it's a common practice in Ruby to "memoize" expensive methods. In simpler terms, to cache the result of a method body in a private instance variable.

This is how it looks in Ruby.

```ruby
def stat
  @_stat ||= File.stat(path)
end
```

I love what I call the "or-equals" operator in Ruby. Others call it the "short-circuit" operator. It works like this. If the variable `@_stat` is falsey, it will run `File.stat` and store the result in the `@_stat` variable. Finally, since Ruby always returns the result of the last expression in a block or method, the resulting `@_stat` value is returned. This has the effect of only running `File.stat` the first time this method is invoked. All other times, we just get the cached `@_stat` value.

Can this type of thing be done in JavaScript?

Not so long ago, JavaScript added "getter" and "setter" methods to classes. Like Ruby, you can call these methods without parenthesis.

```js
class FSEntry {
  get stats() {
    return fs.statsSync(this.path);
  }
}

const entry = new FSEntry(path);
entry.stats; // No parens!
```

Now to cache the result, we can port the same strategy we used in Ruby. Create a private instance variable to cache the result the first time the method is called.

```js
class FSEntry {
  get stats() {
    if (this._stats !== undefined) return this._stats;
    const result = fs.statsSync(this.path);
    this._stats = result;
    return result;
  }
}
```

This gets the job done, but it's painfully verbose. No developer happiness increase. And if you're using TypeScript it's even worse.

```ts
class FSEntry {
  private _stats: undefined | fs.Stats;
  get stats() {
    if (this._stats !== undefined) return this._stats;
    const result = fs.statsSync(this.path);
    this._stats = result;
    return result;
  }
}
```

This is ridiculous.

After some thought, I found a way to reign in the chaos. First, I made a utility function off in a different file that looks like this.

```js
function cache(self, prop, func) {
  const cache = self[prop];
  if (cache !== undefined) return cache;
  const result = func();
  self[prop] = result;
  return result;
}
```

This function checks for a property `prop` on the `self` argument. If it exists, return it. If not, run the `func` and assign the result to that property and return it.

Here's how we call it.

```js
import { cache } from "../utils.js";

class FSEntry {
  get stats() {
    return cache(this, "_stats", () => fs.statSync(this.path));
  }
}
```

And we're back! To a one-liner! Now we can cache methods all over the place.

What about Type Safety?

All you TypeScript purists may wince at that memo function. But to me, the tradeoff is so so worth it. Here's how I typed the cache function in my app.

```ts
function cache<T>(self: object, prop: string, func: () => T): T {
  const cache = self[prop];
  if (cache) return cache;
  const result = func();
  self[prop] = result;
  return result;
}
```

The return type of the `func` parameter is inferred and used as the return type for the whole `cache` function.

Pretty sweet.
