---
draft: true
---

My application is a window with multiple tabs. The tabs are associated with a "workspace". So when you switch the workspace, I need to pull up the tabs for that workspace, then when I switch back, I need to pull up the tabs for each workspace.

I'm using React and Redux. How should I structure my reducers? There are some lesser known, but useful ideas in the secion of the Redux docs called [Beyond `combineReducers`](https://redux.js.org/usage/structuring-reducers/beyond-combinereducers).

For reasons, I have the state like this. We already store the current workspace id in the "current" slice of state. I want to add a "workspaceTabs" slice to contain the tabsState for each workspace.

```ts
type = {
  current: {workspaceId: string}
  workspaceTabs: {[workspaceId: string]: TabsState}
}
```

Getting the current set of tabs is easy thanks to createSelector.

```ts
createSelector(
  (state) => state.current.workspaceId,
  (state) => state.workspaceTabs,
  (id, workspaceTabs) => {
    return workspaceTabs[id];
  }
);
```

You can select from multiple sections of the state to get this done.

But sending actions to the current set of tabs is trickier.

```ts
const isTabsAction = ({ type }) =>
  type.startsWith("TABS/") || isTabAction({ type });

type LakeTabsState = Record<string, TabsState>;

export function reducer(
  state: LakeTabsState,
  action: AnyAction,
  lakeId: string
) {
  if (isTabsAction(action)) {
    return {
      ...state,
      [lakeId]: tabsReducer(state[lakeId], action),
    };
  } else if (isReduxAction) {
    for (const id in state) {
      state[id] = tabsReducer(state[id], action);
    }
  } else {
    return state;
  }
}
```

Well this doesn't work. If you're using redux/toolkit, then combineReducers will strip out anything that's not included in the combine reducers thing.

If you're using any sort of higher level library like redux/toolkit, this is impossible. You can't pass a third argument to a reducer created from createSlice or createReducer. You've got to write the function yourself. Which means you've got to do all the boilerplate again.And you need to depend directly on Immer and use that api to keep state updates the same. Or you've got to use reduceReducers. Reducers are hard enough to reason about, now I'm going to reduce the reducers. And now one part of your state is different from the rest. Not ideal.

The answer is this. Do not try to share state between slices in reducers. If you need to access some other part of the state in the reducer, either move the state so that they both live in the reducer or pass the necessary state in the action. Or use a thunk to add it in real quick.

It's crazy that you'd have to rearround the whole cobine reducers to just get into a third argument.

https://itnext.io/passing-state-between-reducers-in-redux-318de6db06cd

https://immerjs.github.io/immer/curried-produce

https://redux.js.org/usage/structuring-reducers/beyond-combinereducers

https://github.com/reduxjs/redux/issues/1844

Some advice is just write your own combine reducers, but then I've got to use all the boilerplate again. There is no way to use redux/toolkit to spit out a reducer that will accept a third argument. So you need to write it yourself, and you're back to the boilerplate, n eeding immer directly, or writing the verbose.

https://redux-toolkit.js.org/api/createreducer

https://redux-toolkit.js.org/api/createSlice

If I see one more.

https://twitter.com/specialCaseDev/status/1679253438788698113
