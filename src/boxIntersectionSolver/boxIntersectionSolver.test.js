import * as boxIntersectionSolver from './boxIntersectionSolver.js'

describe('Box intersection solver functions', () => {
  describe('getImpossibilities', () => {
    test.todo('getImpossibilities')
  })

  describe('getOtherIndexes', () => {
    const { getOtherIndexes } = boxIntersectionSolver

    test.each([
      [0, [3, 4, 5, 6, 7, 8]],
      [1, [0, 1, 2, 6, 7, 8]],
      [2, [0, 1, 2, 3, 4, 5]]
    ])('getOtherIndexes(%d) === %j', (index, expected) => {
      expect(getOtherIndexes(index)).toEqual(expected)
    })
  })

  describe('processBoxIntersections', () => {
    test.todo('processBoxIntersections')
  })

  describe('allBoxIntersections', () => {
    test.todo('allBoxIntersections')
  })

  describe('rowAndColBoxIntersections', () => {
    test.todo('rowAndColBoxIntersections')
  })
})
