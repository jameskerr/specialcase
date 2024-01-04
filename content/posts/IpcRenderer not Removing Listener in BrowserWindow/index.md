---
title: "IpcRenderer Not Removing Listener in BrowserWindow"
date: 2023-12-01T11:16:55-08:00
draft: true
tags: [electron, react]
---

In my electron app, I was trying to setup an ipc listener in my React code.

I needed to add the listener in the useEffect body, and return a function that would clean up the event listener.

My first approach didn't work. I just exported the methods from ipcRenderer in my preload script.

What did work, was returning a function that cleaned up the listener from the addListener clause.

This must have been something about exposeInMainWorld that caused the function identity to change, and not be cleaned up. 

This GitHub issue pointed me in the right direction.

https://github.com/reZach/secure-electron-template/issues/43

```
useEffect(() => {
    const fn = (e, menuId, id, update) => {
      console.log("handling")
      if (name !== menuId) return
      const index = items.findIndex((item) => item.id === id)
      if (index !== -1) {
        items[index] = {...items[index], ...update}
        setItems([...items])
      }
    }

    return global.zui.on("menus.update", fn)
  }, [items, name])
  ```
  
  ```
  const preloadApi = () => ({
  on: (channel, handler) => {
    ipcRenderer.on(channel, handler)
    return () => {
      ipcRenderer.off(channel, handler)
    }
  },
  once: ipcRenderer.once.bind(ipcRenderer),
  invoke: ipcRenderer.invoke.bind(ipcRenderer),
  emit: ipcRenderer.emit.bind(ipcRenderer),
})

contextBridge.exposeInMainWorld("zui", preloadApi())
```