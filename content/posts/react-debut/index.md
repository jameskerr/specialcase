---
title: "React Debut: A Component and Hook to Animate In and Out"
date: 2023-09-08T16:50:54-07:00
draft: true
description: A React Component to handle entrance and exit animations.
---

Though I've been working with React years, animating elements while they are leaving the DOM has always been hard for me. Today I spent a few hours coming up with a component and a hook that does the job with an API simple enough, I won't have to think this hard ever again.

There are many libraries to animate components in React, but they all seem so heavy. I want to write CSS animations. They're already there and they're plenty good enough for the kind of animation I need writing web apps.

```jsx

  const [show, setShow] = useState(false)
  const debut = useDebut({afterExit: () => setShow(false)})

	if (!show) return null
	
  return (
	  <Debut {...debut.props}>
			...
	  </Debut>
  )
}
```

Debut relies only relies on the very lightweight package `react-transition-group`. It adds css classes to its direct child when a transition is taking place. You get three classes per direction. You can think of the as a starting place, a destination, and a resting place. Different styles can be defined for entering and exiting.

