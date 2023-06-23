Use Data Transitions

I have data that is in motion. It has a "transitioning" flag which means that  we don't want to update UI yet, we want to give the data a change to becoming meaningful within a specified timeout.

Before:

<video src="./before.mp4"></video>

Notice how each time we change the query, there's a flash of emptiness in the histogram.

After:

<video src="./after.mp4"></video>

No more jumpy blank state.

This is going to be a react hook with a three arguments. The data that is changing, a flag to know if we are transitioning, and the timeout.

We need to cache the data right we had before the transition begins. So just always keep a cache of the data if transitioning is false.

```js
const [cache, setCache] = useState()

useEffect(() => {
		if (!inTransition) {
		  setCache(data)
		}
}, [inTransition, data])
```

Ok, this makes sense. Now what if we are in transition. We want to wait for a period of time before updating the cache with the most recent values.

```js
useEffect(() => {
  if (inTransition) {
    setTimeout(() => {
      
    })
  }
})
```

Sometimes we want to return the real data, sometimes we want to return the cache. 

```js
if (inTransition && !timeExpired) return prev
else return real
```

Real is easy, that's just what was passed into the hook. The prev value needs to be the most recent state of real right before inTransition changed.

```js
const prev = useRef()
useEffect(() => {
  if (!inTransition) prev.current = real
}, [inTransition, real])
```

Now we just need to know if the timer expired or not.

```js
const [timeExpired, setTimeExpired] = useState(false)
useEffect(() => {
  let id
  if (inTransition) {
    setTimeout(() => {
      setTimeExpired(true)
    }, timeout)
  } else {
    setTimeExpired(false)
  }
  return () => clearTimeout(id)
}, [inTransition])
```

That might be all that's needed. Let's check.

Here's the full hook.



```ts
export function useDataTransition<T>(
  real: T,
  inTransition: boolean,
  timeout: number
) {
  const [timeExpired, setTimeExpired] = useState(false)
  const prev = useRef(real)

  useEffect(() => {
    if (!inTransition) prev.current = real
  }, [inTransition, real])

  useEffect(() => {
    let id: number
    if (inTransition) {
      id = setTimeout(() => setTimeExpired(true), timeout)
    } else {
      setTimeExpired(false)
    }
    return () => clearTimeout(id)
  }, [inTransition])

  if (inTransition && !timeExpired) return prev.current
  else return real
}
```

