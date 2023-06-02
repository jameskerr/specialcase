Complex Components

Complex components tend to need a mix of controlled state and uncontrolled state.

Uncontrolled state need an imperative API to change the internal state.

Controlled components must receive the state and callbacks when the state should be updated.

React Arborist is a complex component. It needs state for focus, edits, selection, drag and drop, data.

Props are external. State is internal.

A good approach could be if a prop is provided, is that, otherwize use the stat. Props override internal state.

I like this becfause you can get started with minimal boilerplate but then take as much control as you need to.

You see Tanner Lindsay doing this with the react-table component. You see react doing this with inputs.

input
defaultValue -< managed interally
value -< managed externally
onChange <- managed externally

data
onDataChange

This sucks in a way because we dont know "how" it changed.

We would hvae to do a diff to change it. What if onChange returned an action?

Data
onDataChange => (action)
initialEdit
editState
onEditStateChange
initialEditValue
onEditChange
editValue = {id: null}
selectionValue
onSelectionChange
initialSelectionValue
selectionValue = {id}

You could even allow the thing to be fully controlled by passing in your own state and reducer function.

Or semi-=controlled by passing in each slice.

Or fully controlled by passing in nothing.