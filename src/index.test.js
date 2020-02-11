import mod from '.'
import {
  getLabels,
  getRequestFactories,
  getRequestReducer,
} from '.'

// These are the entities we will request.


xit('should return factories!', () => {
  const REQUESTS = [
    [ 'idea', 'create' ],
    // [ 'idea', 'delete' ],
    // [ 'idea', 'update' ],
    // [ 'ideas', 'list' ],
    // [ 'user', 'create' ],
    // [ 'user', 'load' ],
    // [ 'user', 'login' ],
    // [ 'user', 'logout' ],
  ]
  const result = mod(REQUESTS)
  expect(result).toEqual({})
})

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
