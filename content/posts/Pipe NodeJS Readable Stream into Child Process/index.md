---
title: How to Pipe a NodeJS Readable Stream into a Child Process
date: 2023-09-22T10:00:27-07:00
draft: false
tags: ["javascript", "node"]
---

I love pipes. Anytime I can pipe something somewhere, it seems that order has claimed a victory over chaos. In fact, there is pipe-related photo of me at the end of this article for your viewing pleasure.

The other day I was working in NodeJS and wanted to pipe a readable stream to a spawned child process.

I wanted something that could do this.

```js
const process = createProcess(args);
const zq = createTransformStream(process);
const data = input.pipe(zq); // <-- Very cool

await client.load(data);
```

The child process needed to be a wrapped in a transform stream that would feed data to stdin and pass on data from stdout.

## Spawn a Child Process

First, I spawned my process. NodeJS provides the [spawn](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) function to fire up an executable on your file system. The return value is a [ChildProcess](https://nodejs.org/api/child_process.html#class-childprocess) object.

```js
function createProcess(args) {
  // Massage your args for the binary you're using.
  return spawn(bin, spawnargs);
}
```

## Wrap the Child Process in a Transform Stream

Now we need to wrap that process in a [transform stream](https://nodejs.org/api/stream.html#class-streamtransform) so that we can pipe, pipe, pipe.

The steps:

1. Receive a chunk of data as an argument in the `transform` function.
2. Write that chunk to the child's `stdin` .
3. Receive data coming from the child's `stdout` .
4. Push that data into the transform stream.
5. Handle errors and clean up.

Here is the code.

```js
function createTransformStream(child) {
  const stream = new Stream.Transform({
    transform(chunk, encoding, callback) {
      if (child.stdin.write(chunk, encoding)) {
        process.nextTick(callback);
      } else {
        child.stdin.once("drain", callback);
      }
    },

    flush(callback) {
      child.stdin.end();
      if (child.stdout.destroyed) callback();
      else child.stdout.on("close", () => callback());
    },
  });

  child.stdin.on("error", (e) => {
    if (e.code === "EPIPE") {
      // finished before reading the file finished (i.e. head)
      stream.emit("end");
    } else {
      stream.destroy(e);
    }
  });

  child.stdout
    .on("data", (data) => stream.push(data))
    .on("error", (e) => stream.destroy(e));

  child.stderr
    .on("data", (data) => stream.destroy(new Error(data.toString())))
    .on("error", (e) => stream.destroy(e));

  return stream;
}
```

Before we go into detail about what this code does, let's discuss a very confusing topic for me, NodeJS streams.

## Understanding NodeJS Readables

A [readable](https://nodejs.org/api/stream.html#readable-streams) is like a file. Call `readable.read()` to get the first chunk of data from the file.

```js
const chunk = readable.read();
```

But if I am creating my own readable, it starts off empty. There is no data to read. To add some, use the `readable.push()` method.

```js
readable.push("my-chunk-of-data");
```

This was confusing to me, because I am essentially "writing" data into the readable. But don't say it like that, because the `write()` method name is already taken as we'll see next.

## Understanding NodeJS Writables

A [writable](https://nodejs.org/api/stream.html#writable-streams) is a destination for data to land. The writable thing takes the data I give it with `writable.write()` and does something with it. To indicate that I have written all the data I have to it, I call `writable.end()`.

```js
writable.write("first chunk");
writable.write("second chunk");
writable.write("ok, i'm done");
writable.end();
```

## Understanding NodeJS Duplex Streams

To make everything super confusing, some objects can be both [readable and writable](https://nodejs.org/api/stream.html#duplex-and-transform-streams). This means I can call `.push()`, `.read()`, `.write()`, and `.end()` on these things.

A special type of duplex stream is called the [transform stream](https://nodejs.org/api/stream.html#class-streamtransform). It provides a shorthand way of reading from a source and writing to a destination. That's what I used in the code above.

## Detailed Code Breakdown

First we create the transform stream which will be the return value. We implement two methods in the constructor, `transform()` and `flush()`. The first is called when a chunk of data is read from a source, the second is called when there's no more data to read.

### The Transform Function

```js
transform(chunk, encoding, callback) {
  if (child.stdin.write(chunk, encoding)) {
		process.nextTick(callback);
  } else {
		child.stdin.once('drain', callback);
  }
}
```

The [transform function](https://nodejs.org/api/stream.html#transform_transformchunk-encoding-callback) has the arguments `chunk`, `encoding`, and `callback`. The `chunk` is the bit of data that was just read and the `callback` is supposed to be called after I've processed it.

I pass that bit of data to my child process by writing to the process `stdin`. If `stdin.write()` returns true, it's ready to accept more data so I call the `callback` on the next tick. If it returns false, it wants me to wait for the `"drain"` event before continuing, so we call the `callback` once that event is fired. This is called "respecting back-pressure." Respect.

### The Flush Function

```js
flush(callback) {
  child.stdin.end();
  if (child.stdout.destroyed) callback();
  else child.stdout.on('close', () => callback());
}
```

The [flush function](https://nodejs.org/api/stream.html#transform_flushcallback) is called when the stream has finished reading the source. It has one `callback` argument that should be called when I've cleaned everything up. In the body, I tell the child process' `stdin` that I will no longer write any more data. Then I wait for the child process' `stdout` to close before calling the `callback`.

### Listening to stdout

```js
child.stdout
  .on("data", (data) => stream.push(data))
  .on("error", (e) => stream.destroy(e));
```

This is where I "push" the data that comes out of my child process into the transform stream. If there's an error, I call [destroy](https://nodejs.org/api/stream.html#writabledestroyerror) and pass in the error.

### Listening to stderr

```js
child.stderr
  .on("data", (data) => stream.destroy(new Error(data.toString())))
  .on("error", (e) => stream.destroy(e));
```

This is some error handling. In my case, if anything gets pushed into `stderr`, I consider it an error and destroy the transform stream providing the appropriate error text.

### Listening to stdin

```js
child.stdin.on("error", (e) => {
  if (e.code === "EPIPE") {
    // the process finished before reading the file finished
    stream.emit("end");
  } else {
    stream.destroy(e);
  }
});
```

More error handling. Sometimes the child process would finish before I had given it all of the file. (The case where I only want the first 5 lines of a long file.) I write to `stdin`, but it's closed up and emits the error code `"EPIPE"`. I handle that by emitting the `"end"` event on the transform stream. This was the only way I could get it to work. I tried calling `.end()` but that didn't cut it. I had to emit the event manually.

If the error code is anything else, I destroy the stream like above.

## article.end()

That's is how I wrapped a NodeJS ChildProcess with a Stream.Transform object so that I can pipe data to and from it. I hope this saves you some time so that you can get back to your pipes.

Here's me with my pipes in 2015.

{{< figure src="bagpipes.jpeg" link="./bagpipes.jpeg">}}
