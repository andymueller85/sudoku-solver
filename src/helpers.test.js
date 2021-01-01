import fs from 'fs'
import * as helpers from './helpers.js'
import { stringifyGrid, seedGrid } from './main.js'

const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = seedGrid(fileInput)

const firstBoxCompleteGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? `${rowI * 3 + colI + 1}` : c))
)
const allIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const duplicatesInFirstRowGrid = grid.map((r, i) => (i === 0 ? r.map(_ => '1') : r))
const firstRowEmptyGrid = grid.map((r, i) => (i === 0 ? r.map(_ => '.') : r))
const firstRowCompleteGrid = grid.map((r, i) => (i === 0 ? r.map((_, idx) => `${idx + 1}`) : r))
const firstColumnCompleteGrid = grid.map((r, i) => [`${i + 1}`, ...r.slice(1)])
const firstColumnEmptyGrid = grid.map(r => ['.', ...r.slice(1)])
const duplicatesInFirstColumnGrid = grid.map(r => ['1', ...r.slice(1)])
const firstBoxEmptyGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? '.' : c))
)
const duplicatesInFirstBoxGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? '1' : c))
)
const gridWithImpossibleCells = grid.map((r, i) =>
  i === 4 ? r.map((c, idx) => `${idx === 0 ? '2' : c}`) : r
)

describe('General helper functions', () => {
  describe('isFilled', () => {
    const { isFilled } = helpers

    test('should return true if cell is not empty', () => {
      expect(isFilled('1')).toBe(true)
    })

    test('should return false if cell is empty', () => {
      expect(isFilled('.')).toBe(false)
    })
  })

  describe('getFilledCellCount', () => {
    const { getFilledCellCount } = helpers

    test('should return the count of filled cells', () => {
      expect(getFilledCellCount(grid)).toBe(35)
    })
  })

  describe('arrayIntersection', () => {
    const { arrayIntersection } = helpers

    test('should return the intersection of the passed-in arrays', () => {
      expect(arrayIntersection([0, 1, 2], [1, 2, 3])).toEqual([1, 2])
    })

    test('should work for any number of arrays', () => {
      expect(arrayIntersection([0, 1, 2], [1, 2, 3], [2, 3, 4])).toEqual([2])
    })

    test('should return empty array when there are no results', () => {
      expect(arrayIntersection([0, 1, 2], [1, 2, 3], [3, 4, 5])).toEqual([])
    })

    test('should work for a single array', () => {
      expect(arrayIntersection([0, 1, 2])).toEqual([0, 1, 2])
    })
  })

  describe('getColumnArray', () => {
    const { getColumnArray } = helpers

    test('should return the specified column as an array', () => {
      expect(getColumnArray(grid, 0)).toEqual('92......4'.split(''))
    })
  })

  describe('swapXY', () => {
    const { swapXY } = helpers

    test('return the grid with x and y axis swapped ', () => {
      expect(stringifyGrid(swapXY(grid))).toMatchSnapshot()
    })
  })

  describe('allArraysAreEqual', () => {
    const { allArraysAreEqual } = helpers

    test('should return true if all arrays passed are the same', () => {
      expect(allArraysAreEqual('12345'.split(), '12345'.split())).toBe(true)
    })

    test('should work for any number of arrays', () => {
      expect(allArraysAreEqual('12345'.split(), '12345'.split(), '12345'.split())).toBe(true)
    })

    test('should return true if only one array is passed', () => {
      expect(allArraysAreEqual('12345'.split())).toBe(true)
    })

    test('should return false if arrays are different', () => {
      expect(allArraysAreEqual('12345'.split(), '1234'.split())).toBe(false)
    })
  })

  describe('getUniqueArrays', () => {
    const { getUniqueArrays } = helpers
    const arr1 = '12345'.split('')
    const arr2 = '1234'.split('')

    test('should return an array containing all of the unique arrays passed in', () => {
      expect(getUniqueArrays(arr1, arr1, arr2)).toEqual([arr1, arr2])
    })

    test('should work for a single repeated array', () => {
      expect(getUniqueArrays(arr1, arr1)).toEqual([arr1])
    })

    test('should work for a single array', () => {
      expect(getUniqueArrays(arr1)).toEqual([arr1])
    })
  })

  describe('gridHasAnyDeadEnds', () => {
    const { gridHasAnyDeadEnds } = helpers

    test('should return false if all empty cells in the grid have a possible value', () => {
      expect(gridHasAnyDeadEnds(grid)).toBe(false)
    })

    test('should return true if there are empty cells for which no value can be placed', () => {
      expect(gridHasAnyDeadEnds(gridWithImpossibleCells)).toBe(true)
    })
  })

  describe('getNextEmptyCellCoordinates', () => {
    const { getNextEmptyCellCoordinates } = helpers
    test.each([
      [0, 0, [0, 2]],
      [0, 8, [1, 1]],
      [3, 7, [3, 8]],
      [3, 8, [4, 0]],
      [8, 8, undefined],
      [8, 6, undefined]
    ])('getNextCellCoordinates(grid, %d, %d) === %j', (rowNum, colNum, expected) => {
      expect(getNextEmptyCellCoordinates(grid, rowNum, colNum)).toEqual(expected)
    })
  })
})

describe('Box helper functions', () => {
  describe('getBoxTopLeft - given a row or column, gives the box top left coordinate', () => {
    const { getBoxTopLeft } = helpers

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
      expect(getBoxTopLeft(rowOrCol)).toBe(expected)
    })
  })

  describe('getBoxCurRow - given a box top left row and cell #, returns the current row', () => {
    const { getBoxCurRow } = helpers

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
      expect(getBoxCurRow(topLeftRow, cell)).toBe(expected)
    })
  })

  describe('getBoxCurCol - given a box top left column and cell #, returns the current column', () => {
    const { getBoxCurColumn } = helpers

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
      expect(getBoxCurColumn(topLeftCol, cell)).toBe(expected)
    })
  })

  describe('getTopLeftColumnForBoxNum', () => {
    const { getTopLeftColumnForBoxNum } = helpers

    test.each([
      [0, 0],
      [1, 3],
      [2, 6],
      [3, 0],
      [4, 3],
      [5, 6],
      [6, 0],
      [7, 3],
      [8, 6]
    ])('getBoxTopLeftCoordinates(%d) === %j', (boxNum, expected) => {
      expect(getTopLeftColumnForBoxNum(boxNum)).toEqual(expected)
    })
  })

  describe('getBoxTopLeftCoordinates', () => {
    const { getBoxTopLeftCoordinates } = helpers

    test.each([
      [0, [0, 0]],
      [1, [0, 3]],
      [2, [0, 6]],
      [3, [3, 0]],
      [4, [3, 3]],
      [5, [3, 6]],
      [6, [6, 0]],
      [7, [6, 3]],
      [8, [6, 6]]
    ])('getBoxTopLeftCoordinates(%d) === %j', (boxNum, expected) => {
      expect(getBoxTopLeftCoordinates(boxNum)).toEqual(expected)
    })
  })

  describe('getBoxIndexes', () => {
    test.todo('getBoxIndexes')
  })

  describe('flattenBox', () => {
    const { flattenBox } = helpers

    test.each([
      [0, 0, '91.2...87'.split('')],
      [0, 3, '4......36'.split('')],
      [0, 6, '.376..1..'.split('')],
      [3, 0, '.95.41...'.split('')],
      [3, 3, '...985...'.split('')],
      [3, 6, '...36.49.'.split('')],
      [6, 0, '..3..947.'.split('')],
      [6, 3, '19......3'.split('')],
      [6, 6, '82...3.16'.split('')]
    ])('flattenBox(%d, %d) === %j', (topLeftRowNum, topLeftColNum, expected) => {
      expect(flattenBox(grid, topLeftRowNum, topLeftColNum)).toEqual(expected)
    })
  })

  describe('unflattenBox', () => {
    const { unflattenBox } = helpers

    test('should return the array as a 3x3 box', () => {
      expect(unflattenBox('123456789'.slice(''))).toEqual([
        '123'.slice(''),
        '456'.slice(''),
        '789'.slice('')
      ])
    })
  })

  describe('flattenBoxes', () => {
    const { flattenBoxes } = helpers

    test('should return the grid with the boxes represented as rows', () => {
      expect(stringifyGrid(flattenBoxes(grid))).toMatchSnapshot()
    })
  })

  describe('unflattenBoxes', () => {
    const { unflattenBoxes, flattenBoxes } = helpers
    const flattenedBoxGrid = flattenBoxes(grid)

    test('should transform the flattened-box grid back to grid by row', () => {
      expect(unflattenBoxes(flattenedBoxGrid)).toEqual(grid)
    })
  })

  describe('rowNeighborsAreFilled', () => {
    test.todo('rowNeighborsAreFilled')
  })

  describe('columnNeighborsAreFilled', () => {
    test.todo('columnNeighborsAreFilled')
  })

  describe('rowNeighborsContainNumber', () => {
    test.todo('rowNeighborsContainNumber')
  })

  describe('columnNeighborsContainNumber', () => {
    test.todo('columnNeighborsContainNumber')
  })

  describe('getPossibleCellValues', () => {
    const { getPossibleCellValues } = helpers

    test.each([
      [0, 2, '6'.split('')],
      [1, 4, '157'.split('')],
      [5, 8, '1258'.split('')],
      [7, 5, '2478'.split('')]
    ])('getPossibleCellValues(grid, %d, %d) === %j', (rowNum, colNum, expected) => {
      expect(getPossibleCellValues(grid, rowNum, colNum)).toEqual(expected)
    })
  })
})

describe('Filled nums functions', () => {
  describe('getFilledNums', () => {
    const { getFilledNums } = helpers

    test('should return the elements of a group that are filled', () => {
      expect(getFilledNums(grid[0])).toEqual('91437'.split(''))
    })

    test('should work for empty group', () => {
      expect(getFilledNums(firstRowEmptyGrid[0])).toEqual([])
    })

    test('should work for full group', () => {
      expect(getFilledNums(firstRowCompleteGrid[0])).toEqual(helpers.possibleNums)
    })
  })

  describe('getRowFilledNums', () => {
    test.todo('getRowFilledNums')
  })

  describe('getColumnFilledNums', () => {
    const { getColumnFilledNums } = helpers

    test('should return all filled values from column', () => {
      expect(getColumnFilledNums(grid, 0)).toEqual('924'.split(''))
    })

    test('should work for empty column', () => {
      expect(getColumnFilledNums(firstColumnEmptyGrid, 0)).toEqual([])
    })

    test('should work for full column', () => {
      expect(getColumnFilledNums(firstColumnCompleteGrid, 0)).toEqual(helpers.possibleNums)
    })

    describe('getBoxFilledNums', () => {
      const { getBoxFilledNums } = helpers

      test('should return all the known numbers for the box', () => {
        expect(getBoxFilledNums(grid, 0, 0)).toEqual('91287'.split(''))
      })

      test('should work for an empty box', () => {
        expect(getBoxFilledNums(firstBoxEmptyGrid, 0, 0)).toEqual([])
      })

      test('should work for a box with all numbers known', () => {
        expect(getBoxFilledNums(firstBoxCompleteGrid, 0, 0)).toEqual(helpers.possibleNums)
      })
    })
  })
})

describe('Missing nums functions', () => {
  describe('getMissingNums', () => {
    const { getMissingNums } = helpers

    test('should return all elements of possible values that do not exist in the group', () => {
      expect(getMissingNums(grid[0])).toEqual('2568'.split(''))
    })

    test('should work for an empty group', () => {
      expect(getMissingNums(firstRowEmptyGrid[0])).toEqual(helpers.possibleNums)
    })

    test('should work for a full group', () => {
      expect(getMissingNums(firstRowCompleteGrid[0])).toEqual([])
    })
  })

  describe('getRowMissingNums', () => {
    test.todo('getRowMissingNums')
  })

  describe('getColumnMissingNums', () => {
    const { getColumnMissingNums } = helpers

    test('should return all missing nums from column', () => {
      expect(getColumnMissingNums(grid, 0)).toEqual('135678'.split(''))
    })

    test('should work for an empty column', () => {
      expect(getColumnMissingNums(firstColumnEmptyGrid, 0)).toEqual(helpers.possibleNums)
    })

    test('s hould work for a full  column', () => {
      expect(getColumnMissingNums(firstColumnCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getBoxMissingNums', () => {
    const { getBoxMissingNums } = helpers

    test('should return all missing numbers for a box', () => {
      expect(getBoxMissingNums(grid, 0, 0)).toEqual('3456'.split(''))
    })

    test('should work for an empty box', () => {
      expect(getBoxMissingNums(firstBoxEmptyGrid, 0, 0)).toEqual(helpers.possibleNums)
    })

    test('should work for a completed box', () => {
      expect(getBoxMissingNums(firstBoxCompleteGrid, 0, 0)).toEqual([])
    })
  })
})

describe('Missing cells functions', () => {
  describe('getMissingCells', () => {
    const { getMissingCells } = helpers

    test.each([
      ['12.456..9'.split(''), [2, 6, 7]],
      ['.........'.split(''), [0, 1, 2, 3, 4, 5, 6, 7, 8]],
      ['123456789'.split(''), []]
    ])('getMissingCells(%j) === %j', (arr, expected) => {
      expect(getMissingCells(arr)).toEqual(expected)
    })
  })

  describe('getRowMissingCells', () => {
    const { getRowMissingCells } = helpers

    test('should return the index of the elements in a row that are not yet determined', () => {
      expect(getRowMissingCells(grid, 0)).toEqual([2, 4, 5, 6])
    })

    test('should work for an empty row', () => {
      expect(getRowMissingCells(firstRowEmptyGrid, 0)).toEqual(allIndexes)
    })

    test('should work for a full row', () => {
      expect(getRowMissingCells(firstRowCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getColumnMissingCells', () => {
    const { getColumnMissingCells } = helpers

    test('should return all missing cell indexes from a column', () => {
      expect(getColumnMissingCells(grid, 0)).toEqual([2, 3, 4, 5, 6, 7])
    })

    test('should work for an empty column', () => {
      expect(getColumnMissingCells(firstColumnEmptyGrid, 0)).toEqual(allIndexes)
    })

    test('should work for a full column', () => {
      expect(getColumnMissingCells(firstColumnCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getBoxMissingCells', () => {
    const { getBoxMissingCells } = helpers

    test('should return all missing cells for a box', () => {
      expect(getBoxMissingCells(grid, 0, 0)).toEqual([2, 4, 5, 6])
    })

    test('should work for an empty box', () => {
      expect(getBoxMissingCells(firstBoxEmptyGrid, 0, 0)).toEqual(allIndexes)
    })

    test('should work for a completed box', () => {
      expect(getBoxMissingCells(firstBoxCompleteGrid, 0, 0)).toEqual([])
    })
  })
})

describe('Validity functions', () => {
  describe('isValid', () => {
    test.todo('isValid')
  })

  describe('rowIsValid', () => {
    const { rowIsValid } = helpers

    test('should return true if there are no duplicate values in a row', () => {
      expect(rowIsValid(grid, 0)).toBe(true)
    })

    test('should return false if there are duplicate values in a row', () => {
      expect(rowIsValid(duplicatesInFirstRowGrid, 0)).toBe(false)
    })
  })

  describe('everyRowIsValid', () => {
    const { everyRowIsValid } = helpers

    test('should return true if every row in the grid is valid', () => {
      expect(everyRowIsValid(grid)).toBe(true)
    })

    test('should return false if any row in the grid is invalid', () => {
      expect(everyRowIsValid(duplicatesInFirstRowGrid)).toBe(false)
    })
  })

  describe('columnIsValid', () => {
    const { columnIsValid } = helpers

    test('should return false if there are duplicates in the column', () => {
      expect(columnIsValid(duplicatesInFirstColumnGrid, 0)).toBe(false)
    })

    test('should return true if no duplicates in the column', () => {
      expect(columnIsValid(grid, 0)).toBe(true)
    })

    test('should work for an empty column', () => {
      expect(columnIsValid(firstColumnEmptyGrid, 0)).toBe(true)
    })
  })

  describe('everyColumnIsValid', () => {
    const { everyColumnIsValid } = helpers

    test('should return false if not every column is valid', () => {
      expect(everyColumnIsValid(duplicatesInFirstColumnGrid)).toBe(false)
    })

    test('should return true if every column is valid', () => {
      expect(everyColumnIsValid(grid)).toBe(true)
    })

    test('should work with an empty column', () => {
      expect(everyColumnIsValid(firstColumnEmptyGrid)).toBe(true)
    })
  })

  describe('boxIsValid', () => {
    const { boxIsValid } = helpers

    test('should return false if box has repeated values', () => {
      expect(boxIsValid(duplicatesInFirstBoxGrid, 0, 0)).toBe(false)
    })

    test('should return true if box has no repeated values', () => {
      expect(boxIsValid(grid, 0, 0)).toBe(true)
    })

    test('should work for an empty box', () => {
      expect(boxIsValid(firstBoxEmptyGrid, 0, 0)).toBe(true)
    })
  })

  describe('everyBoxIsValid', () => {
    const { everyBoxIsValid } = helpers

    test('should return true if every box is valid', () => {
      expect(everyBoxIsValid(grid)).toBe(true)
    })

    test('should return false if any box is inalid', () => {
      expect(everyBoxIsValid(duplicatesInFirstBoxGrid)).toBe(false)
    })

    test('should work for empty box', () => {
      expect(everyBoxIsValid(firstBoxEmptyGrid)).toBe(true)
    })
  })

  describe('gridIsValid', () => {
    const { gridIsValid } = helpers
    test('should return true when all rows, columns & boxes are valid', () => {
      expect(helpers.gridIsValid(grid)).toBe(true)
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

  describe('Completeness functions', () => {
    describe('isComplete', () => {
      test.todo('isComplete')
    })

    describe('rowIsComplete', () => {
      const { rowIsComplete } = helpers

      test('should return false if not every cell in a row is filled', () => {
        expect(rowIsComplete(grid, 0)).toBe(false)
      })

      test('should return true if every cell in a row is filled', () => {
        expect(rowIsComplete(firstRowCompleteGrid, 0)).toBe(true)
      })

      test('should work for an empty row', () => {
        expect(rowIsComplete(firstRowEmptyGrid, 0)).toBe(false)
      })
    })

    describe('columnIsComplete', () => {
      const { columnIsComplete } = helpers

      test('should return false if not every cell in a column is filled', () => {
        expect(columnIsComplete(grid, 0)).toBe(false)
      })

      test('should return true if every cell in a column is filled', () => {
        expect(columnIsComplete(firstColumnCompleteGrid, 0)).toBe(true)
      })

      test('should work when no cells are filled', () => {
        expect(columnIsComplete(firstColumnEmptyGrid, 0)).toBe(false)
      })
    })

    describe('boxIsComplete', () => {
      const { boxIsComplete } = helpers

      test('should return false if any box elements are missing', () => {
        expect(boxIsComplete(grid, 0, 0)).toBe(false)
      })

      test('should work for box with all elements missing', () => {
        expect(boxIsComplete(firstBoxEmptyGrid, 0, 0)).toBe(false)
      })

      test('should return true if all box elements are filled', () => {
        expect(boxIsComplete(firstBoxCompleteGrid, 0, 0)).toBe(true)
      })
    })

    describe('gridIsComplete', () => {
      test.todo('gridIsComplete')
    })
  })
})
