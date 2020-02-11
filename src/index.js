const capitalize = (string) => string.replace(/^.{1,1}/, (x) => x.toUpperCase())

const assert = (x, err) => {
  if (!x) {
    throw new Error(err)
  }
}

export const getLabels = (obj, verb) => {
  assert(obj, 'object is required')
  assert(verb, 'verb is required')

  const cap = capitalize(verb)
  return {
    actionTypeFailure: `${obj}.${verb}.error`,
    actionTypeRequest: `${obj}.${verb}.req`,
    actionTypeSuccess: `${obj}.${verb}.success`,
    stateError: `${obj}${cap}Error`,
    statePending: `${obj}${cap}Pending`,
  }
}

export const getCombinedReducer = (labels, obj) => {
  const {
    actionTypeFailure,
    actionTypeRequest,
    actionTypeSuccess,
    stateError,
    statePending,
  } = labels

  const req = (state, action) => {
    return (action.type === actionTypeRequest)
      ? {
        ...state,
        [stateError]: null,
        [statePending]: true,
        [obj]: null,
      }
      : state
  }

  const failure = (state, action) => {
    return (action.type === actionTypeFailure)
      ? {
        ...state,
        [stateError]: action.error,
        [statePending]: false,
      }
      : state
  }

  const success = (state, action) => {
    return (action.type === actionTypeSuccess)
      ? {
        ...state,
        [statePending]: false,
        [obj]: action[obj],
      }
      : state
  }

  return (state, action) => [
    req,
    failure,
    success,
  ].reduce((acc, reducer) => reducer(acc, action), state)

}

export const getRequestReducer = (obj, verb) => {
  const labels = getLabels(obj, verb)
  const reducer = getCombinedReducer(labels, obj)
  reducer.labels = labels
  reducer.obj = obj
  reducer.verb = verb
  return reducer
}

export const getRequestFactories = (obj, verb) => {
  const {
    actionTypeFailure,
    actionTypeRequest,
    actionTypeSuccess,
  } = getLabels(obj, verb)
  return {
    req: () => ({ type: actionTypeRequest }),
    success: (result) => ({ type: actionTypeSuccess, [obj]: result }),
    failure: (error) => ({ type: actionTypeFailure, error }),
  }
}

export const collectActionTypes = (requestReducers) => {
  const action = {type: {}}
  requestReducers.forEach(({
    obj,
    verb,
    labels,
  }) => {
    const newObj = action.type[obj] || {}
    const {
      actionTypeRequest,
      actionTypeSuccess,
      actionTypeFailure,
    } = labels
    newObj[verb] = {
      req: actionTypeRequest,
      success: actionTypeSuccess,
      failure: actionTypeFailure,
    }
    action.type[obj] = newObj
  })
  return action
}

export default (requestTuples) => {
  // Each of these will follow a consistent naming convention for actions, states,
  // entities, and reducers.  tl;dr - any ajax calls will have "requesting,"
  // "failure," and "success" events and states.
  const requestFactories = requestTuples.reduce((acc, [obj, verb]) => {
    const updatedObj = acc[obj] || {}
    updatedObj[verb] = getRequestFactories(obj, verb)
    return {
      ...acc,
      [obj]: updatedObj,
    }
  }, {})

  const reducers = requestTuples.map(([obj, verb]) => getRequestReducer(obj, verb))
  const requestsReducer = (state, action) => reducers
    .reduce((acc, reducer) => reducer(acc, action), state)

  return {
    reducer: requestsReducer,
    action: collectActionTypes(reducers),
    factories: requestFactories,
  }
}
