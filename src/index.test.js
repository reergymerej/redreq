import mod from '.'
import {
  collectActionTypes,
  getCombinedReducer,
  getLabels,
  getRequestFactories,
  getRequestReducer,
} from '.'

describe('getLabels', () => {
  it('should throw for missing object', () => {
    expect(() => {
      getLabels()
    }).toThrow('object')
  })

  it('should throw for missing verb', () => {
    expect(() => {
      getLabels('fish')
    }).toThrow('verb')
  })

  it('should return labels for use in actions and state', () => {
    expect(getLabels('fish', 'load')).toEqual({
      actionTypeFailure: 'fish.load.error',
      actionTypeRequest: 'fish.load.req',
      actionTypeSuccess: 'fish.load.success',
      stateError: 'fishLoadError',
      statePending: 'fishLoadPending',
    })
  })
})

describe('getRequestReducer', () => {
  it('should include the object/verb', () => {
    const reducer = getRequestReducer('cow', 'update')
    const {
      obj,
      verb,
      labels,
    } = reducer

    expect(labels).toEqual(getLabels('cow', 'update'))
    expect(obj).toEqual('cow')
    expect(verb).toEqual('update')
  })

  describe('the reducer', () => {
    let actionTypeFailure
    let actionTypeRequest
    let actionTypeSuccess
    let reducer

    beforeEach(() => {
      reducer = getRequestReducer('chicken', 'subscribe')
      const labels = getLabels('chicken', 'subscribe')
      actionTypeRequest = labels.actionTypeRequest
      actionTypeFailure = labels.actionTypeFailure
      actionTypeSuccess = labels.actionTypeSuccess
    })

    it('should return unchanged state', () => {
      const state = {}
      expect(reducer(state, {})).toBe(state)
    })

    it('should handle the request', () => {
      const state = {}
      const action = {
        type: actionTypeRequest,
      }
      expect(reducer(state, action)).toEqual({
        chicken: null,
        chickenSubscribeError: null,
        chickenSubscribePending: true,
      })
    })

    it('should handle the failure', () => {
      const state = {}
      const action = {
        type: actionTypeFailure,
        error: 'danger!',
      }
      expect(reducer(state, action)).toEqual({
        chickenSubscribeError: 'danger!',
        chickenSubscribePending: false,
      })
    })

    it('should handle the success', () => {
      const state = {}
      const action = {
        type: actionTypeSuccess,
        chicken: { feathers: true },
      }
      expect(reducer(state, action)).toEqual({
        chickenSubscribePending: false,
        chicken: { feathers: true },
      })
    })

  })
})

describe('getRequestFactories', () => {
  let actionFactories
  beforeEach(() => {
    actionFactories = getRequestFactories('dog', 'pet')
  })

  it('should handle req', () => {
    expect(actionFactories.req()).toEqual({
      type: 'dog.pet.req',
    })
  })

  it('should handle failure', () => {
    expect(actionFactories.failure('bad dog')).toEqual({
      type: 'dog.pet.error',
      error: 'bad dog',
    })
  })

  it('should handle success', () => {
    expect(actionFactories.success({hair: 'shiny'})).toEqual({
      type: 'dog.pet.success',
      dog: {hair: 'shiny'},
    })
  })
})

describe('coverage!', () => {
  it('should ?', () => {
    mod([
      ['donkey', 'paint'],
    ])
  })

  it('should ??', () => {
    const r = mod([
      ['donkey', 'paint'],
    ])
    const state = {}
    const action = {}
    expect(r.reducer(state, action)).toEqual({})
  })
})

describe('collectActionTypes ', () => {
  it('should provide dot-notation access to the action types', () => {
    const reducers = [
      getRequestReducer('dolphin', 'watch'),
    ]
    const { type } = collectActionTypes(reducers)
    expect(type.dolphin.watch.req).toEqual('dolphin.watch.req')
    expect(type.dolphin.watch.failure).toEqual('dolphin.watch.error')
    expect(type.dolphin.watch.success).toEqual('dolphin.watch.success')
  })
})

describe('getCombinedReducer', () => {
  it('should handle request', () => {
    const labels = {
      actionTypeRequest: 'soda.can.fetch.request.triggered',
      stateError: 'sodaCanFetchError',
      statePending: 'waitingForSodaCan',
    }
    const entity = 'sodaCan'
    const r = getCombinedReducer(labels, entity)
    const state = {}
    const action = {
      type: 'soda.can.fetch.request.triggered',
    }
    expect(r(state, action)).toEqual({
      sodaCan: null,
      sodaCanFetchError: null,
      waitingForSodaCan: true,
    })
  })

  it('should handle failure', () => {
    const labels = {
      actionTypeFailure: 'soda.can.fetch.failedMiserably',
      stateError: 'sodaCanFetchError',
      statePending: 'waitingForSodaCan',
    }
    const entity = 'sodaCan'
    const r = getCombinedReducer(labels, entity)
    const state = {}
    const action = {
      type: 'soda.can.fetch.failedMiserably',
      error: 'unable to find can',
    }
    expect(r(state, action)).toEqual({
      sodaCanFetchError: 'unable to find can',
      waitingForSodaCan: false,
    })
  })

  it('should handle success', () => {
    const labels = {
      actionTypeSuccess: 'soda.can.fetch.hooray',
      statePending: 'waitingForSodaCan',
    }
    const entity = 'sodaCan'
    const r = getCombinedReducer(labels, entity)
    const state = {}
    const action = {
      type: 'soda.can.fetch.hooray',
      sodaCan: { empty: true },
    }
    expect(r(state, action)).toEqual({
      waitingForSodaCan: false,
      sodaCan: { empty: true },
    })
  })
})
