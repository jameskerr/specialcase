---
title: "Passing React Refs"
date: 2023-09-12T09:55:23-07:00
draft: true
---

```tsx {hl_lines=[3]}
export function Dialog(props: DialogProps) {
  const ref = useRef<HTMLDialogElement>()
  useOpener(ref.current, props)
  return (
    <dialog ref={ref}>
      {props.children}
    </dialog>
  )
}

```

This just bit me. I was passing ref.current to a hook but At the time I passed it, it was undefined. Undefined gets passed by value, not by reference.

To fix it, I need to pass the ref object. That will pass the reference to the ref object, then when react attaches the ref to the Dom node, the hook will have the Dom node present in 

```
export function useOpener(
  ref: MutableRefObject<HTMLDialogElement>,
  props: DialogProps
) {
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (props.isOpen && !dialog.open) {
      props.modal ? dialog.showModal() : dialog.show()
    } else {
      dialog.close()
    }
  }, [props.isOpen, props.modal])
}
```

You either need a callback ref to fix, or passing the ref object.