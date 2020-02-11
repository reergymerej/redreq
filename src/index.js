/* eslint-disable complexity */

const capitalize = (string) => string.replace(/^.{1,1}/, (x) => x.toUpperCase())

const getLabels = (obj, verb) => {
  const cap = capitalize(verb)
  return {
    actionTypeFailure: `${obj}.${verb}.error`,
    actionTypeRequest: `${obj}.${verb}.req`,
    actionTypeSuccess: `${obj}.${verb}.success`,
    stateError: `${obj}${cap}Error`,
    statePending: `${obj}${cap}Pending`,
  }
}

const getRequestReducer = (obj, verb) => {
  const labels = getLabels(obj, verb)
  const {
    statePending,
    stateError,
    actionTypeRequest,
    actionTypeFailure,
    actionTypeSuccess,
  } = labels

  const reducer = (state, action) => {
    switch (action.type) {
    case actionTypeRequest:
      return {
        ...state,
        [stateError]: null,
        [statePending]: true,
        [obj]: null,
      }

    case actionTypeFailure:
      return {
        ...state,
        [stateError]: action.error,
        [statePending]: false,
      }

    case actionTypeSuccess:
      return {
        ...state,
        [statePending]: false,
        [obj]: action[obj],
      }

    default:
      return state
    }
  }

  reducer.labels = labels
  reducer.obj = obj
  reducer.verb = verb
  return reducer
}


export default (REQUESTS) => {

  const REQUEST_REDUCERS = REQUESTS.map(([obj, verb]) => getRequestReducer(obj, verb))

  const requestsReducer = (state, action) => REQUEST_REDUCERS
    .reduce((acc, reducer) => reducer(acc, action), state)

  const getRequestFactories = (obj, verb) => {
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

  const collectActionTypes = (requestReducers) => {
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

  // Each of these will follow a consistent naming convention for actions, states,
  // entities, and reducers.  tl;dr - any ajax calls will have "requesting,"
  // "failure," and "success" events and states.
  const requestFactories = REQUESTS.reduce((acc, [obj, verb]) => {
    const updatedObj = acc[obj] || {}
    updatedObj[verb] = getRequestFactories(obj, verb)
    return {
      ...acc,
      [obj]: updatedObj,
    }
  }, {})


  const requests = {
    reducer: requestsReducer,
    action: collectActionTypes(REQUEST_REDUCERS),
    factories: requestFactories,
  }

  return requests
}
