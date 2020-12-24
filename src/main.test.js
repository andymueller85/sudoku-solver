import { expect } from '@jest/globals'
import * as main from './main'

const grid = main.startingGrid
const allIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8]

describe('Row Operations', () => {
  const duplicatesInFirstRowGrid = grid.map((r, i) =>
    i === 0 ? r.map(_ => ({ value: '1', locked: true })) : r
  )
  const firstRowEmptyGrid = grid.map((r, i) =>
    i === 0 ? r.map(_ => ({ value: '.', locked: false })) : r
  )
  const firstRowCompleteGrid = grid.map((r, i) =>
    i === 0 ? r.map((_, idx) => ({ value: `${idx + 1}`, locked: true })) : r
  )

  describe('rowIsComplete', () => {
    const fut = main.rowIsComplete

    test('should return false if not every cell in a row is locked', () => {
      expect(fut(grid, 0)).toEqual(false)
    })

    test('should return true if every cell in a row is locked', () => {
      expect(fut(firstRowCompleteGrid, 0)).toEqual(true)
    })

    test('should work for an empty row', () => {
      expect(fut(firstRowEmptyGrid, 0)).toEqual(false)
    })
  })

  describe('rowIsValid', () => {
    const fut = main.rowIsValid

    test('should return true if there are no duplicate values in a row', () => {
      expect(fut(grid, 0)).toEqual(true)
    })

    test('should return false if there are duplicate values in a row', () => {
      expect(fut(duplicatesInFirstRowGrid, 0)).toEqual(false)
    })
  })

  describe('everyRowIsValid', () => {
    const fut = main.everyRowIsValid

    test('should return true if every row in the grid is valid', () => {
      expect(fut(grid)).toEqual(true)
    })

    test('should return false if any row in the grid is invalid', () => {
      expect(fut(duplicatesInFirstRowGrid)).toEqual(false)
    })
  })

  describe('getRowLockedNums', () => {
    const fut = main.getRowLockedNums

    test('should return the elements of a row that are locked', () => {
      expect(fut(grid, 0)).toEqual('91437'.split(''))
    })

    test('should work for empty row', () => {
      expect(fut(firstRowEmptyGrid, 0)).toEqual([])
    })

    test('should work for full row', () => {
      expect(fut(firstRowCompleteGrid, 0)).toEqual(main.possibleNums)
    })
  })

  describe('getRowMissingNums', () => {
    const fut = main.getRowMissingNums

    test('should return all elements of possible values that do not exist in the row', () => {
      expect(fut(grid, 0)).toEqual('2568'.split(''))
    })

    test('should work for an empty row', () => {
      expect(fut(firstRowEmptyGrid, 0)).toEqual(main.possibleNums)
    })

    test('should work for a full row', () => {
      expect(fut(firstRowCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getRowMissingCells', () => {
    const fut = main.getRowMissingCells

    test('should return the index of the elements in a row that are not yet determined', () => {
      expect(fut(grid, 0)).toEqual([2, 4, 5, 6])
    })

    test('should work for an empty row', () => {
      expect(fut(firstRowEmptyGrid, 0)).toEqual(allIndexes)
    })

    test('should work for a full row', () => {
      expect(fut(firstRowCompleteGrid, 0)).toEqual([])
    })
  })
})

describe('Column Operations', () => {
  const firstColumnCompleteGrid = grid.map((r, i) => [
    { value: `${i + 1}`, locked: true },
    ...r.slice(1)
  ])
  const firstColumnEmptyGrid = grid.map(r => [
    { value: '.', locked: false },
    ...r.slice(1)
  ])
  const duplicatesInFirstColumnGrid = grid.map(r => [
    { value: '1', locked: true },
    ...r.slice(1)
  ])

  describe('columnIsComplete', () => {
    const fut = main.columnIsComplete

    test('should return false if not every cell in a column is locked', () => {
      expect(fut(grid, 0)).toEqual(false)
    })

    test('should return true if every cell in a column is locked', () => {
      expect(fut(firstColumnCompleteGrid, 0)).toEqual(true)
    })

    test('should work when no cells are locked', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toEqual(false)
    })
  })

  describe('columnIsValid', () => {
    const fut = main.columnIsValid

    test('should return false if there are duplicates in the column', () => {
      expect(fut(duplicatesInFirstColumnGrid, 0)).toEqual(false)
    })

    test('should return true if no duplicates in the column', () => {
      expect(fut(grid, 0)).toEqual(true)
    })

    test('should work for an empty column', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toEqual(true)
    })
  })

  describe('everyColumnIsValid', () => {
    const fut = main.everyColumnIsValid

    test('should return false if not every column is valid', () => {
      expect(fut(duplicatesInFirstColumnGrid)).toEqual(false)
    })

    test('should return true if every column is valid', () => {
      expect(fut(grid)).toEqual(true)
    })

    test('should work with an empty column', () => {
      expect(fut(firstColumnEmptyGrid)).toEqual(true)
    })
  })

  describe('getColumnLockedNums', () => {
    const fut = main.getColumnLockedNums

    test('should return all locked values from column', () => {
      expect(fut(grid, 0)).toEqual('924'.split(''))
    })

    test('should work for empty column', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toEqual([])
    })

    test('should work for full column', () => {
      expect(fut(firstColumnCompleteGrid, 0)).toEqual(main.possibleNums)
    })
  })

  describe('getColumnMissingNums', () => {
    const fut = main.getColumnMissingNums

    test('should return all missing nums from column', () => {
      expect(fut(grid, 0)).toEqual('135678'.split(''))
    })

    test('should work for an empty column', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toEqual(main.possibleNums)
    })

    test('should work for a full column', () => {
      expect(fut(firstColumnCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getColumnMissingCells', () => {
    const fut = main.getColumnMissingCells

    test('should return all missing cell indexes from a column', () => {
      expect(fut(grid, 0)).toEqual([2, 3, 4, 5, 6, 7])
    })

    test('should work for an empty column', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toEqual(allIndexes)
    })

    test('should work for a full column', () => {
      expect(fut(firstColumnCompleteGrid, 0)).toEqual([])
    })
  })
})
