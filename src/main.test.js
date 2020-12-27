import fs from 'fs'
import { expect } from '@jest/globals'
import * as main from './main'
import lodash from 'lodash'

const { cloneDeep } = lodash

const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = main.seedGrid(fileInput)
const allIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const duplicatesInFirstRowGrid = grid.map((r, i) =>
  i === 0 ? r.map(_ => '1') : r
)
const firstRowEmptyGrid = grid.map((r, i) => (i === 0 ? r.map(_ => '.') : r))
const firstRowCompleteGrid = grid.map((r, i) =>
  i === 0 ? r.map((_, idx) => `${idx + 1}`) : r
)
const firstColumnCompleteGrid = grid.map((r, i) => [`${i + 1}`, ...r.slice(1)])
const firstColumnEmptyGrid = grid.map(r => ['.', ...r.slice(1)])
const duplicatesInFirstColumnGrid = grid.map(r => ['1', ...r.slice(1)])
const firstBoxCompleteGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? `${rowI * 3 + colI + 1}` : c))
)
const firstBoxEmptyGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? '.' : c))
)
const duplicatesInFirstBoxGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? '1' : c))
)

describe('Row Operations', () => {
  describe('rowIsComplete', () => {
    const fut = main.rowIsComplete

    test('should return false if not every cell in a row is filled', () => {
      expect(fut(grid, 0)).toBe(false)
    })

    test('should return true if every cell in a row is filled', () => {
      expect(fut(firstRowCompleteGrid, 0)).toBe(true)
    })

    test('should work for an empty row', () => {
      expect(fut(firstRowEmptyGrid, 0)).toBe(false)
    })
  })

  describe('rowIsValid', () => {
    const fut = main.rowIsValid

    test('should return true if there are no duplicate values in a row', () => {
      expect(fut(grid, 0)).toBe(true)
    })

    test('should return false if there are duplicate values in a row', () => {
      expect(fut(duplicatesInFirstRowGrid, 0)).toBe(false)
    })
  })

  describe('everyRowIsValid', () => {
    const fut = main.everyRowIsValid

    test('should return true if every row in the grid is valid', () => {
      expect(fut(grid)).toBe(true)
    })

    test('should return false if any row in the grid is invalid', () => {
      expect(fut(duplicatesInFirstRowGrid)).toBe(false)
    })
  })

  describe('getRowFilledNums', () => {
    const fut = main.getRowFilledNums

    test('should return the elements of a row that are filled', () => {
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
  describe('columnIsComplete', () => {
    const fut = main.columnIsComplete

    test('should return false if not every cell in a column is filled', () => {
      expect(fut(grid, 0)).toBe(false)
    })

    test('should return true if every cell in a column is filled', () => {
      expect(fut(firstColumnCompleteGrid, 0)).toBe(true)
    })

    test('should work when no cells are filled', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toBe(false)
    })
  })

  describe('columnIsValid', () => {
    const fut = main.columnIsValid

    test('should return false if there are duplicates in the column', () => {
      expect(fut(duplicatesInFirstColumnGrid, 0)).toBe(false)
    })

    test('should return true if no duplicates in the column', () => {
      expect(fut(grid, 0)).toBe(true)
    })

    test('should work for an empty column', () => {
      expect(fut(firstColumnEmptyGrid, 0)).toBe(true)
    })
  })

  describe('everyColumnIsValid', () => {
    const fut = main.everyColumnIsValid

    test('should return false if not every column is valid', () => {
      expect(fut(duplicatesInFirstColumnGrid)).toBe(false)
    })

    test('should return true if every column is valid', () => {
      expect(fut(grid)).toBe(true)
    })

    test('should work with an empty column', () => {
      expect(fut(firstColumnEmptyGrid)).toBe(true)
    })
  })

  describe('getColumnFilledNums', () => {
    const fut = main.getColumnFilledNums

    test('should return all filled values from column', () => {
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

describe('Box Operations', () => {
  describe('getBoxTopLeft - given a row or column, gives the box top left coordinate', () => {
    const fut = main.getBoxTopLeft

    test.each([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 3],
      [4, 3],
      [5, 3],
      [6, 6],
      [7, 6],
      [8, 6]
    ])('getBoxTopLeft(%d) === %d', (rowOrCol, expected) => {
      expect(fut(rowOrCol)).toBe(expected)
    })
  })

  describe('getBoxCurRow - given a box top left row and cell #, returns the current row', () => {
    const fut = main.getBoxCurRow

    test.each([
      [0, 0, 0],
      [0, 3, 1],
      [0, 6, 2],
      [3, 1, 3],
      [3, 4, 4],
      [3, 7, 5],
      [6, 2, 6],
      [6, 5, 7],
      [6, 8, 8]
    ])('getBoxCurRow(%d, %d) === %d', (topLeftRow, cell, expected) => {
      expect(fut(topLeftRow, cell)).toBe(expected)
    })
  })

  describe('getBoxCurCol - given a box top left column and cell #, returns the current column', () => {
    const fut = main.getBoxCurColumn

    test.each([
      [0, 0, 0],
      [0, 4, 1],
      [0, 8, 2],
      [3, 3, 3],
      [3, 7, 4],
      [3, 2, 5],
      [6, 6, 6],
      [6, 1, 7],
      [6, 5, 8]
    ])('getBoxCurColumn(%d, %d) === %d', (topLeftCol, cell, expected) => {
      expect(fut(topLeftCol, cell)).toBe(expected)
    })
  })

  describe('boxIsComplete', () => {
    const fut = main.boxIsComplete

    test('should return false if any box elements are missing', () => {
      expect(fut(grid, 0, 0)).toBe(false)
    })

    test('should work for box with all elements missing', () => {
      expect(fut(firstBoxEmptyGrid, 0, 0)).toBe(false)
    })

    test('should return true if all box elements are filled', () => {
      expect(fut(firstBoxCompleteGrid, 0, 0)).toBe(true)
    })
  })

  describe('boxIsValid', () => {
    const fut = main.boxIsValid

    test('should return false if box has repeated values', () => {
      expect(fut(duplicatesInFirstBoxGrid, 0, 0)).toBe(false)
    })

    test('should return true if box has no repeated values', () => {
      expect(fut(grid, 0, 0)).toBe(true)
    })

    test('should work for an empty box', () => {
      expect(fut(firstBoxEmptyGrid, 0, 0)).toBe(true)
    })
  })

  describe('everyBoxIsValid', () => {
    const fut = main.everyBoxIsValid

    test('should return true if every box is valid', () => {
      expect(fut(grid)).toBe(true)
    })

    test('should return false if any box is inalid', () => {
      expect(fut(duplicatesInFirstBoxGrid)).toBe(false)
    })

    test('should work for empty box', () => {
      expect(fut(firstBoxEmptyGrid)).toBe(true)
    })
  })

  describe('getBoxFilledNums', () => {
    const fut = main.getBoxFilledNums

    test('should return all the known numbers for the box', () => {
      expect(fut(grid, 0, 0)).toEqual('91287'.split(''))
    })

    test('should work for an empty box', () => {
      expect(fut(firstBoxEmptyGrid, 0, 0)).toEqual([])
    })

    test('should work for a box with all numbers known', () => {
      expect(fut(firstBoxCompleteGrid, 0, 0)).toEqual(main.possibleNums)
    })
  })

  describe('getBoxMissingNums', () => {
    const fut = main.getBoxMissingNums

    test('should return all missing numbers for a box', () => {
      expect(fut(grid, 0, 0)).toEqual('3456'.split(''))
    })

    test('should work for an empty box', () => {
      expect(fut(firstBoxEmptyGrid, 0, 0)).toEqual(main.possibleNums)
    })

    test('should work for a completed box', () => {
      expect(fut(firstBoxCompleteGrid, 0, 0)).toEqual([])
    })
  })

  describe('getBoxMissingCells', () => {
    const fut = main.getBoxMissingCells

    test('should return all missing cells for a box', () => {
      expect(fut(grid, 0, 0)).toEqual([2, 4, 5, 6])
    })

    test('should work for an empty box', () => {
      expect(fut(firstBoxEmptyGrid, 0, 0)).toEqual(allIndexes)
    })

    test('should work for a completed box', () => {
      expect(fut(firstBoxCompleteGrid, 0, 0)).toEqual([])
    })
  })
})

describe('Cell-checking functions', () => {
  const gridWithFirstRowOneCellLeft = grid.map((r, rowIndex) =>
    r.map((c, cIndex) =>
      rowIndex === 0 ? (cIndex > 0 ? `${cIndex + 1}` : '.') : c
    )
  )

  const gridWithFirstColumnOneCellLeft = grid.map((r, rowIndex) =>
    r.map((c, cIndex) =>
      cIndex === 0 ? (rowIndex > 0 ? `${rowIndex + 1}` : '.') : c
    )
  )

  const { axis } = main

  describe('checkCellAgainstOtherAxis', () => {
    const fut = main.checkCellAgainstOtherAxis

    test.each([axis.x, axis.y])(
      'should return false if the box already contains the number - %s axis',
      testAxis => {
        expect(fut(grid, 1, 1, '7', testAxis)).toBe(false)
      }
    )

    test.each([
      [axis.x, '6'],
      [axis.y, '5']
    ])(
      'should return false if the number is already in the current axis - %s axis',
      (testAxis, num) => {
        expect(fut(grid, 1, 2, num, testAxis)).toBe(false)
      }
    )

    test.each([axis.x, axis.y])(
      'should return false if there is a row or column (opposite this one) that does not contain the number - %s axis',
      testAxis => {
        expect(fut(grid, 2, 0, '5', testAxis)).toBe(false)
      }
    )

    test('should return false if the box already includes the number', () => {
      expect(fut(grid, 1, 4, '4')).toBe(false)
    })

    test('should return true if every other empty cell column contains the number - X axis', () => {
      expect(fut(grid, 4, 0, '7', axis.x)).toBe(true)
    })

    test('should return true if number is only one left for the row', () => {
      expect(fut(gridWithFirstRowOneCellLeft, 0, 0, '1', axis.x)).toBe(true)
    })

    test('should return true if number is only one left for the column', () => {
      expect(fut(gridWithFirstColumnOneCellLeft, 0, 0, '1', axis.y)).toEqual(
        true
      )
    })
  })

  describe('cellCanBeDeterminedForRow', () => {
    const fut = main.cellCanBeDeterminedForRow
    // cases are mostly tested by checkCellAGainstOtherAxis tests, just test a couple cases here.
    test('should return true if number is only one left for the row', () => {
      expect(fut(gridWithFirstRowOneCellLeft, 0, 0, '1')).toBe(true)
    })

    test('should return false if not', () => {
      expect(fut(gridWithFirstRowOneCellLeft, 1, 4, '1')).toBe(false)
    })
  })

  describe('cellCanBeDeterminedForColumn', () => {
    const fut = main.cellCanBeDeterminedForColumn
    // cases are mostly tested by checkCellAGainstOtherAxis tests, just test a couple cases here.
    test('should return true if number is only one left for the column', () => {
      expect(fut(gridWithFirstColumnOneCellLeft, 0, 0, '1')).toBe(true)
    })

    test('should return false if not', () => {
      expect(fut(gridWithFirstColumnOneCellLeft, 1, 4, '1')).toBe(false)
    })
  })

  describe('Fill methods', () => {
    const { stringifyGrid, fillRows, fillColumns, fillBoxes } = main
    describe('fillRows', () => {
      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillRows(cloneDeep(grid)))).toMatchSnapshot()
      })
    })

    describe('fillColumns (phil collims?)', () => {
      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillColumns(cloneDeep(grid)))).toMatchSnapshot()
      })
    })

    describe('fillBoxes', () => {
      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillBoxes(cloneDeep(grid)))).toMatchSnapshot()
      })
    })
  })

  describe('grid-level checks', () => {
    describe('getKnownCellCount', () => {
      test('should return the count of filled cells', () => {
        expect(main.getFilledCellCount(grid)).toBe(35)
      })
    })

    describe('GridIsValid', () => {
      const { gridIsValid } = main
      test('should return true when all rows, columns & boxes are valid', () => {
        expect(main.gridIsValid(grid)).toBe(true)
      })

      test('should return false if there are duplicates in a row', () => {
        expect(gridIsValid(duplicatesInFirstRowGrid)).toBe(false)
      })

      test('should return false if there are duplicates in a column', () => {
        expect(gridIsValid(duplicatesInFirstColumnGrid)).toBe(false)
      })

      test('should return false if there are duplicates in a box', () => {
        expect(gridIsValid(duplicatesInFirstBoxGrid)).toBe(false)
      })
    })
  })
})
 
describe('Utilities', () => {
  describe('getPossibleCellValues', () => {
    const { getPossibleCellValues } = main

    test.each([
      [0, 2, '6'.split('')],
      [1, 4, '157'.split('')],
      [5, 8, '1258'.split('')],
      [7, 5, '2478'.split('')]
    ])(
      'getPossibleCellValues(grid, %d, %d) === %j',
      (rowNum, colNum, expected) => {
        expect(getPossibleCellValues(grid, rowNum, colNum)).toEqual(expected)
      }
    )
  })

  describe('getNextCell', () => {
    const { getNextCellCoordinates } = main
    test.each([
      [0, 0, [0, 1]],
      [3, 7, [3, 8]],
      [3, 8, [4, 0]],
      [8, 8, undefined]
    ])(
      'getNextCellCoordinates(grid, %d, %d) === %j',
      (rowNum, colNum, expected) => {
        expect(getNextCellCoordinates(rowNum, colNum)).toEqual(expected)
      }
    )
  })
})

describe('fillAutomaticCells', () => {
  const { stringifyGrid, fillAutomaticCells } = main
  test('should match snapshot after processing', () => {
    expect(stringifyGrid(fillAutomaticCells(cloneDeep(grid)))).toMatchSnapshot()
  })
})
