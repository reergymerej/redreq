import mod from '.'

// These are the entities we will request.


it('should return factories!', () => {
  const REQUESTS = [
    [ 'idea', 'create' ],
    [ 'idea', 'delete' ],
    [ 'idea', 'update' ],
    [ 'ideas', 'list' ],
    [ 'user', 'create' ],
    [ 'user', 'load' ],
    [ 'user', 'login' ],
    [ 'user', 'logout' ],
  ]
  const result = mod(REQUESTS)
  expect(result).toEqual({})
})
