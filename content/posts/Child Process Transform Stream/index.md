---
title: "Child Process Transform Stream"
date: 2023-09-21T10:00:27-07:00
draft: true
---

```bash
cat my-file.json | zq 'upper(name)' - | zed load
```

Pipes are the best. I love pipes. Anytime I can pipe something somewhere, the world is a better place. In fact, there is pipes-related photo of me at the end of this article! Incentives!

I was working on a node project where I wanted to read some data from a readable stream, pipe it into a spawned child process for some transformation, then pipe the transformed output to an http post body.

The finished code looked something like this.

```js
const process = createProcess(args);

const zq = createTransformStream(process);

const data = input.pipe(zq)

await client.load(data)
```

First we need to write a function that will spawn the child process. Some tools might require an extra option to read from standard in.

```js
function createProcess(args) {
  // Massage your args for the binary you're using.
  return spawn(bin, spawnargs);
}
```

Now we need to convert that process into a Transform Stream. A transform stream has both the Writable and Readable interfaces. Data can be written to it and read from it. Let's pause to discuss the differences between Readable and Writeable in NodeJS.

## Understanding NodeJS Readables

A Readable is like a file. Most of the time, the text is already in the file and code that has the readable call `readable.read()` to get some of it.

```js
const string = readable.read()
```

But often, if you are creating your own Readable, it starts off empty. There is no data to read from it. To add data to the readable, you use the `readable.push(data)` method. This was confusing to me, because you are essentially "writing" data into the readable. But we can't say that because of the Writeable we're about to talk about next. We are "pushing" data into a readable. At some point, someone might call .read() to get the data back out.

```js
readable.push("my-important-data")
```

## Understanding NodeJS Writables

A Writeable is a destination for data to land. The writable thing takes the data you give it with `writable.write("my-important-data")` and does something with it. To indicate that you've written all the data you have to it, you call `writable.end()`.


## Understanding NodeJS Duplex Streams

To make everything super confusing, some objects can be both Readable and Writable. This means you can call `.push()`, `.read()`, `.write()`, and `.end()` on these things.

A special type of Duplex stream is called the Transform Stream. It provides a shorthand way of reading from a source and writing to a destination. We are going to use one of these in this example.

## Using the Child Process in the Transform Stream

Here is the code that takes a child process as its only argument, and returns a Transform stream that we can pipe input to.

```js
function createTransformStream(child) {
  const stream = new Stream.Transform({
    transform(chunk, encoding, callback) {
      if (!child.stdin.write(chunk, encoding)) {
        child.stdin.once('drain', callback);
      } else {
        process.nextTick(callback);
      }
    },

    flush(callback) {
      child.stdin.end();
      if (child.stdout.destroyed) callback();
      else child.stdout.on('close', () => callback());
    },
  });

  child.stdin.on('error', (e: Error & { code: string }) => {
    if (e.code === 'EPIPE') {
      // zq finished before reading the file finished (i.e. head proc)
      stream.emit('end');
    } else {
      stream.destroy(e);
    }
  });

  child.stdout
    .on('data', (data) => stream.push(data))
    .on('error', (e) => stream.destroy(e));

  child.stderr
    .on('data', (data) => stream.destroy(new Error(data.toString())))
    .on('error', (e) => stream.destroy(e));

  return stream;
}
```

## How It Works

First we create the transform stream which will be the return value. We implement two methods, `transform()` and `flush()`. The first is called when a chunk of data is read from a source, the second is called when there's no more data to read.

```js
transform(chunk, encoding, callback) {
  if (child.stdin.write(chunk, encoding)) {
		process.nextTick(callback);
  } else {
		child.stdin.once('drain', callback);
  }
}
```

The transform function has the arguments `chunk`, `encoding`, and `callback`. The `chunk` is the bit of data that was just read and the `callback` is supposed to be called after we've processed it.

No we pass that bit of data to our child process by writing to the process' stdin. If `stdin.write()` returns true, it's ready to accept more, so we call the `callback` on the next tick. If it returns false, it wants us to wait for the "drain" event before continuing, so we call the  `callback` once that event is fired. This is called "respecting back-pressure." Respect.

```js
flush(callback) {
  child.stdin.end();
  if (child.stdout.destroyed) callback();
  else child.stdout.on('close', () => callback());
}
```

The flush function is called when we've finished reading the source and has one `callback` argument that should be called when we've cleaned everything up. In the body, we tell the child process' stdin that we will no longer write any more data. Then we wait for the child process' stdout to close, and call the `callback`.

```js
child.stdout
	.on('data', (data) => stream.push(data))
	.on('error', (e) => stream.destroy(e));
```

This is where we "push" the data that comes out of our child process to the Transform stream. If there's an error, we call destroy and pass in the error.

```js
child.stderr
	.on('data', (data) => stream.destroy(new Error(data.toString())))
 	.on('error', (e) => stream.destroy(e));
```

This is some error handling. In my case, if anything gets pushed into child.stderr, I consider it an error and destroy the transform stream providing the appropriate error text.

```js
child.stdin.on('error', (e: Error & { code: string }) => {
	if (e.code === 'EPIPE') {
	  // the process finished before reading the file finished
	  stream.emit('end');
	} else {
	  stream.destroy(e);
	}
});
```

More error handling. In my case, sometimes the child process would finish before I had given it all of the file. (Think in the case where I only want the first 5 lines of a long file.) In that case, I would write the stdin above, but stdin was closed up. This would emit an error with a code "EPIPE". So I handle that by emitting the "end" event on the stream. This was the only way I could get it to work. I tried calling .end() but that didn't cut it. I had to emit the event manually.

If the error code is anything else, I destroy the stream like above.

## article.end()

Now you've got a way to turn a NodeJS ChildProcess into a Stream.Transform object, we can get back to piping everything everywhere. I hope this post saves you some time so that you can get back to your pipes. 

Here's me with my pipes in 2015!

{{< figure src="bagpipes.jpeg" link="./bagpipes.jpeg">}}
