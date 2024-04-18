---
title: 13 Decisions to Make Before Publishing JavaScript to NPM
date: 2023-03-30T09:00:00-07:00
draft: false
tags: ["javascript", "npm"]
---

This post is half rant, half guide. Each of these 13 questions reveals tradeoffs that take time and mental energy to research. In case you don't already have enough to decide today, here's what you must consider when creating and publishing a new JavaScript package.

### 1. Do you want to write it in TypeScript?

If so, you'll need to compile it before publishing. Bookmark the the [tsconfig.json](https://www.typescriptlang.org/tsconfig) reference.

### 2. Do you want to compile using tsc, swc, or esbuild?

By default, TypeScript uses [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to type check and transpile your source .ts files into regular JavaScript. It's slower because it's written in JavaScript. Other tools like [swc](https://swc.rs/) (Rust) or [esbuild](https://esbuild.github.io/) (Go) transpile much faster, but do not type check. Nobody likes waiting around for a build, but maybe you'd rather have one tool.

### 3. Do you want it to run in Node?

Now you need to decide your module format.

### 4. Do you want to output your package as ESM or CJS?

[CommonJS modules](https://nodejs.org/api/modules.html#modules-commonjs-modules) (CJS) was the original way to include code from another file in Node. [ECMAScript modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) (ESM) is now the standard way to include JS code and Node just recently implemented support for it. The community wants us to move to [pure ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c), but many things are CJS and they don't exactly interop seamlessly.

### 5. Are any of your dependencies pure ESM?

Using them in your CJS project is not going to work out of the box.

### 6. Are any of your dependents CJS?

They won't be able to use your pure ESM library out of the box.

### 7. Since Node can run ESM and CJS, do you want to support both?

Then you need to avoid the [Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard) when both versions of your library might end up loaded at the same time.

### 8. Do you want it to run in browsers?

Since all browsers can run ESM, you'll probably choose that as your module format, as opposed to [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) or an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE).

### 9. Will you bundle all your code into a single JS file?

This will make it download faster. You probably want it minified too.

### 10. Will you inline your dependencies in the bundle?

This will make it download slower, but it will be more portable.

### 11. Will you use a CDN to get it into the browser?

You'll need to know about services like [jsDelivr](https://www.jsdelivr.com/) or [Skypack](https://www.skypack.dev/) which automatically serve packages in the npm registry. Some services let you leave the npm dependencies out of the bundle while their CDNs serve them for you. Otherwise your users will need to download the bundle like the old days or npm install it and link to it in node_modules from their HTML page. ES modules must have an explicit path to a real file, no index.js or package.json magic. Or you can use [import maps](https://github.com/WICG/import-maps).

### 12. Do you want to bundle it for node?

Esbuild talks about doing this [in their docs](https://esbuild.github.io/getting-started/#bundling-for-node). It can be faster to read from the disc.

### 13. Where will you specify your entry point in package.json?

The top choices for your [entry point](https://nodejs.org/api/packages.html#package-entry-points) are: ["exports"](https://nodejs.org/api/packages.html#main-entry-point-export), ["main"](https://nodejs.org/api/packages.html#main), and ["browser"](https://github.com/defunctzombie/package-browser-field-spec). Each runtime and build tool will use this information to run or compile your code.

## What. A. Nightmare.

To simply share some JavaScript you've got to consider JS runtimes, module formats, and build tools with no one true way. Was it easier when cross-browser compatibility was the big headache?

## My Answers

I had to spend the time making these decisions for my own package [@brimdata/zed-js](https://www.npmjs.com/package/@brimdata/zed-js). A JavaScript client package for the [Zed](https://zed.brimdata.io/) data platform. Here's what I came up with.

**I will write TypeScript**.

**I will use [nx](https://nx.dev/)** to generate the project because their developers have many sane decisions for me. Thank you!

**I will build a sole CJS version** for Node since I plan to consume this package in an Electron app and [Electron doesn't yet support ESM](https://github.com/electron/electron/issues/21457). This was a hard decision because [respected community members](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c?permalink_comment_id=3850849#gistcomment-3850849) are pushing valiantly for pure ESM packages. I agree philosophically 100%. If I wasn't the one consuming this package, I'd go pure ESM. However, I don't feel like [hacking around Electron](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c?permalink_comment_id=3850849#gistcomment-3850849) to get my own code to run, so I'm compromising on my values for today.

**I will use tsc to build** the CJS version to avoid another tool. If my project were huge, I'd use to swc to build and tsc to lint.

**I will leave the CJS version unbundled** because...[what happens in node_modules](https://medium.com/s/silicon-satire/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558), stays in node_modules.

**I will use the "exports" field** in package.json to point to the Node entry point. It has some advantages over "main" and will make it easier to switch to pure ESM in the future.

**I will use esbuild** to bundle an ESM version for the web.

**I will inline my dependencies** because I don't have many and they are not big. If they were big, I'd consider using a CDN like Skypack.

**I will use the "browser" field** in package.json to point to the bundle.

## Hope For Brighter Days

My introduction to programming came from Ruby on Rails. It championed the principle "convention over configuration" when the back-end landscape was overgrown with XML config files for Java VMs.

Today we are in having a "configuration-heavy" moment in the front-end world, but I have hope that good conventions will emerge. Then we can get back to doing the real work.
