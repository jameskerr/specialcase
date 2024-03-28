---
title: "Using @monaco-editor/react in Electron without Internet Connection"
date: 2024-03-27T16:58:00-07:00
draft: false
tags: ["react", "electron", "monaco"]
---

The [Monaco Editor](https://microsoft.github.io/monaco-editor/) is awesome. It's what powers VSCode. I wanted to use it to power the query editor pane in [Zui](https://zui.brimdata.io/), the data exploration app I work on. I reached for [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) because it fit well in the app's NextJS, React, and Electron tech stack. Loading the actual [monaco-editor](https://www.npmjs.com/package/monaco-editor) code seems to be a bit of a headache, so in an effort to make setup simple, @monaco-editor/react fetches the minified monaco-editor files from [jsdelivr](https://www.jsdelivr.com/) over the network.

This was a problem. Zui should work without needing to be connected to the internet.

My solution involved a configuration change in @monaco-editor/react, custom protocol handlers in electron, and disabling the webSecurity option in my browser window instances (only in development).

The first step was to add the [monaco-editor](https://www.npmjs.com/package/monaco-editor) package to my dependencies.

```bash
yarn add monaco-editor
```

Then I configured the `@monaco-editor/react` loader to fetch the files from my own made up url. This code should run in the browser window before react mounts up.

```js
import { loader } from "@monaco-editor/react";

// This is how you change the source of the monaco files.
loader.config({
  paths: {
    vs: "app-asset://zui/node_modules/monaco-editor/min/vs",
  },
});
```

What's the deal with that url? I just made it up. It can be anything because I will intercept requests to it in electron's main process using the [protocol](https://www.electronjs.org/docs/latest/api/protocol) module. Then I can fetch the appropriate file from the node_modules directory on disc and return it.

Here was my finished code. This should run in the main process during initialization before any browser windows are created.

```ts
import { app, protocol } from "electron";
import { AssetUrl } from "../protocols/asset-url";
import { AssetServer } from "../protocols/asset-server";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app-asset",
    privileges: {
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

const server = new AssetServer();

app.whenReady().then(() => {
  protocol.handle("app-asset", (request) => {
    const asset = new AssetUrl(request.url);

    if (asset.isNodeModule) {
      return server.fromNodeModules(asset.relativeUrl);
    } else {
      return server.fromPublic(asset.relativeUrl);
    }
  });
});
```

First we register the `"app-asset"` scheme with "standard" privileges, making it behavie like the `"http"` scheme. Read more about that [here](https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes).

Then I new up my little `AssetServer` class which is responsible for finding the files on the file system to return to the requestor. That code is posted below.

Once the app fires the `"ready"` event, I intercept all requests to the `"app-asset"` scheme, using [protocol.handle()](https://www.electronjs.org/docs/latest/api/protocol#protocolhandlescheme-handler). If the pathname starts with "/node_modules" I look it up using Node's [require.resolve](https://nodejs.org/api/modules.html#requireresolverequest-options) and return it. Otherwise I look for that file in the public directory and return it.

Here's the code for the `AssetServer` class.

```ts
import { app, net } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

export class AssetServer {
  fromNodeModules(relativePath: string) {
    const file = require.resolve(relativePath);
    const url = pathToFileURL(file).toString();
    return net.fetch(url, { bypassCustomProtocolHandlers: true });
  }

  fromPublic(relativeUrl: string) {
    const file = path.join(app.getAppPath(), "out", relativeUrl);
    const url = pathToFileURL(file).toString();
    return net.fetch(url, { bypassCustomProtocolHandlers: true });
  }
}
```

Notice the `{bypassCustomProtocolHandlers: true}` option. This is just in case I have other protocol handlers in my app for the `"file://"` scheme. If I don't bypass, then my other custom protocol handlers will intercept this new request. Took me a whole day to figure that one out.

And the code for the `AssetUrl` class.

```ts
export class AssetUrl {
  url: URL;

  constructor(url: string) {
    this.url = new URL(url);
  }

  get isNodeModule() {
    return this.url.pathname.startsWith("/node_modules");
  }

  get relativeUrl() {
    if (this.isNodeModule) {
      return this.url.pathname.replace("/node_modules/", "");
    } else {
      return this.url.pathname.replace(/^\//, "");
    }
  }
}
```

Now depending on how you are serving your HTML file, you may see this error below in the dev tools.

```
Failed to construct 'Worker': Script at 'app-asset://node_modules/monaco-editor/min/vs/base/worker/workerMain.js#editorWorkerService' cannot be accessed from origin 'http://localhost:4567'.
```

I was serving my HTML files from the NextJS development server on port 4567. This is my code that loads the HTML in electron.

```ts
const url = env.isDevelopment
  ? `http://localhost:4567${this.path}?id=${this.id}&name=${this.name}`
  : `app-asset://zui${this.path}.html?id=${this.id}&name=${this.name}`;

browserWindow.loadURL(url);
```

The reason for the error is the "same-origin" policy enforced by the browser window. This means that JavaScript can't load more JavaScript from a different site. In my setup, the monaco code was trying to fetch a file at the `app-asset://zui` origin, but it was running on the `http://localhost:4567` origin.

As you can see above, in production, the html file is also loaded from the `app-asset://zui` origin so this error will not occur.

To fix it in development, I decided to disable the same-origin check on the browser window, by passing `false` to the `webSecurity` option in [webPreferences](https://www.electronjs.org/docs/latest/api/structures/web-preferences).

```ts
const browserWindow = new BrowserWindow({
  webPreferences: {
    webSecurity: env.isProduction,
  },
});
```

That `env` object is a utility module I created to check for environment variables like `process.NODE_ENV === "production"` .

And that's all folks. I am happy with the resulting code and now the app works offline. What a concept.
