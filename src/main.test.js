import fs from 'fs'
import { expect } from '@jest/globals'
import * as main from './main'
import lodash from 'lodash'

const { cloneDeep } = lodash

const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = main.seedGrid(fileInput)
const allIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const duplicatesInFirstRowGrid = grid.map((r, i) => (i === 0 ? r.map(_ => '1') : r))
const firstRowEmptyGrid = grid.map((r, i) => (i === 0 ? r.map(_ => '.') : r))
const firstRowCompleteGrid = grid.map((r, i) => (i === 0 ? r.map((_, idx) => `${idx + 1}`) : r))
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
const gridWithImpossibleCells = grid.map((r, i) =>
  i === 4 ? r.map((c, idx) => `${idx === 0 ? '2' : c}`) : r
)
const flattenedBoxGrid = main.flattenBoxes(grid)

describe('Row Operations', () => {
  describe('rowIsComplete', () => {
    const { rowIsComplete } = main

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

  describe('rowIsValid', () => {
    const { rowIsValid } = main

    test('should return true if there are no duplicate values in a row', () => {
      expect(rowIsValid(grid, 0)).toBe(true)
    })

    test('should return false if there are duplicate values in a row', () => {
      expect(rowIsValid(duplicatesInFirstRowGrid, 0)).toBe(false)
    })
  })

  describe('everyRowIsValid', () => {
    const { everyRowIsValid } = main

    test('should return true if every row in the grid is valid', () => {
      expect(everyRowIsValid(grid)).toBe(true)
    })

    test('should return false if any row in the grid is invalid', () => {
      expect(everyRowIsValid(duplicatesInFirstRowGrid)).toBe(false)
    })
  })

  describe('getRowFilledNums', () => {
    const { getRowFilledNums } = main

    test('should return the elements of a row that are filled', () => {
      expect(getRowFilledNums(grid, 0)).toEqual('91437'.split(''))
    })

    test('should work for empty row', () => {
      expect(getRowFilledNums(firstRowEmptyGrid, 0)).toEqual([])
    })

    test('should work for full row', () => {
      expect(getRowFilledNums(firstRowCompleteGrid, 0)).toEqual(main.possibleNums)
    })
  })

  describe('getRowMissingNums', () => {
    const { getRowMissingNums } = main

    test('should return all elements of possible values that do not exist in the row', () => {
      expect(getRowMissingNums(grid, 0)).toEqual('2568'.split(''))
    })

    test('should work for an empty row', () => {
      expect(getRowMissingNums(firstRowEmptyGrid, 0)).toEqual(main.possibleNums)
    })

    test('should work for a full row', () => {
      expect(getRowMissingNums(firstRowCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getRowMissingCells', () => {
    const { getRowMissingCells } = main

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
})

describe('C olumn Operations ', () => {
  describe('columnIsComplete', () => {
    const { columnIsComplete } = main

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

  describe('columnIsValid', () => {
    const { columnIsValid } = main

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
    const { everyColumnIsValid } = main

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

  describe('getColumnFilledNums', () => {
    const { getColumnFilledNums } = main

    test('should return all filled values from column', () => {
      expect(getColumnFilledNums(grid, 0)).toEqual('924'.split(''))
    })

    test('should work for empty column', () => {
      expect(getColumnFilledNums(firstColumnEmptyGrid, 0)).toEqual([])
    })

    test('should work for full column', () => {
      expect(getColumnFilledNums(firstColumnCompleteGrid, 0)).toEqual(main.possibleNums)
    })
  })

  describe('getColumnMissingNums', () => {
    const { getColumnMissingNums } = main

    test('should return all missing nums from column', () => {
      expect(getColumnMissingNums(grid, 0)).toEqual('135678'.split(''))
    })

    test('should work for an empty column', () => {
      expect(getColumnMissingNums(firstColumnEmptyGrid, 0)).toEqual(main.possibleNums)
    })

    test('s hould work for a full  column', () => {
      expect(getColumnMissingNums(firstColumnCompleteGrid, 0)).toEqual([])
    })
  })

  describe('getColumnMissingCells', () => {
    const { getColumnMissingCells } = main

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
})

describe('Box Operations', () => {
  describe('getBoxTopLeft - given a row or column, gives the box top left coordinate', () => {
    const { getBoxTopLeft } = main

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

  describe('getTopLeftColumnForBoxNum', () => {
    const { getTopLeftColumnForBoxNum } = main

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

  describe('swapXY', () => {
    const { swapXY, stringifyGrid } = main
    test('return the grid with x and y axis swapped ', () => {
      expect(stringifyGrid(swapXY(grid))).toMatchSnapshot()
    })
  })

  describe('getBoxTopLeftCoordinates', () => {
    const { getBoxTopLeftCoordinates } = main

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

  describe('getBoxCurRow - given a box top left row and cell #, returns the current row', () => {
    const { getBoxCurRow } = main

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
    const { getBoxCurColumn } = main

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

  describe('boxIsComplete', () => {
    const { boxIsComplete } = main

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

  describe('boxIsValid', () => {
    const { boxIsValid } = main

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
    const { everyBoxIsValid } = main

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

  describe('getBoxFilledNums', () => {
    const { getBoxFilledNums } = main

    test('should return all the known numbers for the box', () => {
      expect(getBoxFilledNums(grid, 0, 0)).toEqual('91287'.split(''))
    })

    test('should work for an empty box', () => {
      expect(getBoxFilledNums(firstBoxEmptyGrid, 0, 0)).toEqual([])
    })

    test('should work for a box with all numbers known', () => {
      expect(getBoxFilledNums(firstBoxCompleteGrid, 0, 0)).toEqual(main.possibleNums)
    })
  })

  describe('getBoxMissingNums', () => {
    const { getBoxMissingNums } = main

    test('should return all missing numbers for a box', () => {
      expect(getBoxMissingNums(grid, 0, 0)).toEqual('3456'.split(''))
    })

    test('should work for an empty box', () => {
      expect(getBoxMissingNums(firstBoxEmptyGrid, 0, 0)).toEqual(main.possibleNums)
    })

    test('should work for a completed box', () => {
      expect(getBoxMissingNums(firstBoxCompleteGrid, 0, 0)).toEqual([])
    })
  })

  describe('getBoxMissingCells', () => {
    const { getBoxMissingCells } = main

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

describe('Cell-checking functions', () => {
  const gridWithFirstRowOneCellLeft = grid.map((r, rowIndex) =>
    r.map((c, cIndex) => (rowIndex === 0 ? (cIndex > 0 ? `${cIndex + 1}` : '.') : c))
  )

  const gridWithFirstColumnOneCellLeft = grid.map((r, rowIndex) =>
    r.map((c, cIndex) => (cIndex === 0 ? (rowIndex > 0 ? `${rowIndex + 1}` : '.') : c))
  )

  const { axis } = main

  describe('cellCanBeDeterminedForRow', () => {
    const { cellCanBeDeterminedForRow } = main

    test('should return false if the box already contains the number', () => {
      expect(cellCanBeDeterminedForRow(grid, 1, 1, '7')).toBe(false)
    })

    test('should return false if the number is already in the current row', () => {
      expect(cellCanBeDeterminedForRow(grid, 1, 2, '6')).toBe(false)
    })

    test('should return false if there is a column that does not contain the number ', () => {
      expect(cellCanBeDeterminedForRow(grid, 2, 0, '5')).toBe(false)
    })

    test('should return false if the box already includes the number', () => {
      expect(cellCanBeDeterminedForRow(grid, 1, 4, '4')).toBe(false)
    })

    test('should return true if every other empty cell column contains the number - X axis', () => {
      expect(cellCanBeDeterminedForRow(grid, 4, 0, '7', axis.x)).toBe(true)
    })

    test('should return true if number is only one left for the row', () => {
      expect(cellCanBeDeterminedForRow(gridWithFirstRowOneCellLeft, 0, 0, '1', axis.x)).toBe(true)
    })
  })

  describe('cellCanBeDeterminedForBox', () => {
    const { cellCanBeDeterminedForBox } = main
    const firstBoxOneCellEmptyGrid = cloneDeep(firstBoxCompleteGrid)
    firstBoxOneCellEmptyGrid[0][0] = '.'
    const firstBoxFirstTwoCellsEmptyGrid = cloneDeep(firstBoxCompleteGrid)
    firstBoxFirstTwoCellsEmptyGrid[0][0] = '.'
    firstBoxFirstTwoCellsEmptyGrid[0][1] = '.'

    // cases are mostly tested by checkCellAGainstOtherAxis tests, just test a couple cases here.
    test('should return true if number is only one left for the box', () => {
      expect(cellCanBeDeterminedForBox(firstBoxOneCellEmptyGrid, 0, 0, 0, '1')).toBe(true)
    })

    test('should return false if not', () => {
      expect(cellCanBeDeterminedForBox(firstBoxFirstTwoCellsEmptyGrid, 0, 0, 0, '1')).toBe(false)
    })
  })

  describe('Fill methods', () => {
    const { stringifyGrid, fillRows, fillColumns, fillBoxes } = main
    describe('fillRows', () => {
      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillRows(grid))).toMatchSnapshot()
      })
    })

    describe('fillColumns (phil collims?)', () => {
      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillColumns(grid))).toMatchSnapshot()
      })
    })

    describe('fillBoxes', () => {
      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillBoxes(grid))).toMatchSnapshot()
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
    ])('getPossibleCellValues(grid, %d, %d) === %j', (rowNum, colNum, expected) => {
      expect(getPossibleCellValues(grid, rowNum, colNum)).toEqual(expected)
    })
  })

  describe('allArraysAreEqual', () => {
    const { allArraysAreEqual } = main

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
    const { getUniqueArrays } = main
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

  describe('getNextEmptyCellCoordinates', () => {
    const { getNextEmptyCellCoordinates } = main
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

  describe('isFilled', () => {
    const { isFilled } = main

    test('should return true if cell is not empty', () => {
      expect(isFilled('1')).toBe(true)
    })

    test('should return false if cell is empty', () => {
      expect(isFilled('.')).toBe(false)
    })
  })

  describe('getArrayMissingCells', () => {
    const { getArrayMissingCells } = main
    test.each([
      ['12.456..9'.split(''), [2, 6, 7]],
      ['.........'.split(''), [0, 1, 2, 3, 4, 5, 6, 7, 8]],
      ['123456789'.split(''), []]
    ])('getArrayMissingCells(%j) === %j', (arr, expected) => {
      expect(getArrayMissingCells(arr)).toEqual(expected)
    })
  })

  describe('gridHasAnyDeadEnds', () => {
    const { gridHasAnyDeadEnds } = main

    test('should return false if all empty cells in the grid have a possible value', () => {
      expect(gridHasAnyDeadEnds(grid)).toBe(false)
    })

    test('should return true if there are empty cells for which no value can be placed', () => {
      expect(gridHasAnyDeadEnds(gridWithImpossibleCells)).toBe(true)
    })
  })

  describe('flattenBox', () => {
    const { flattenBox } = main

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

  describe('getOtherIndexes', () => {
    const { getOtherIndexes } = main

    test.each([
      [0, [3, 4, 5, 6, 7, 8]],
      [1, [0, 1, 2, 6, 7, 8]],
      [2, [0, 1, 2, 3, 4, 5]]
    ])('getOtherIndexes(%d) === %j', (index, expected) => {
      expect(getOtherIndexes(index)).toEqual(expected)
    })
  })

  describe('arrayIntersection', () => {
    const { arrayIntersection } = main

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
})

describe('flattenBoxes', () => {
  const { flattenBoxes, stringifyGrid } = main

  test('should return the grid with the boxes represented as rows', () => {
    expect(stringifyGrid(flattenBoxes(grid))).toMatchSnapshot()
  })
})

describe('unflattenBox', () => {
  const { unflattenBox } = main

  test('should return the array as a 3x3 box', () => {
    expect(unflattenBox('123456789'.slice(''))).toEqual([
      '123'.slice(''),
      '456'.slice(''),
      '789'.slice('')
    ])
  })
})

describe('unflattenBoxes', () => {
  const { unflattenBoxes } = main

  test('should transform the flattened-box grid back to grid by row', () => {
    expect(unflattenBoxes(flattenedBoxGrid)).toEqual(grid)
  })
})

describe('Fill Cells methods', () => {
  const { stringifyGrid, fillCellsLogically, fillCellsBruteForce, seedGrid } = main
  const fileInputHard = fs.readFileSync('./input_hard.txt', 'utf8')
  const gridHard = seedGrid(fileInputHard)
  const automaticCellsFilledGrid = fillCellsLogically(gridHard).grid
  const allCellsFilledGrid = fillCellsBruteForce(automaticCellsFilledGrid).grid

  describe('fillCellsLogically', () => {
    test('should match snapshot after processing', () => {
      expect(stringifyGrid(gridHard)).toMatchSnapshot()
    })
  })

  describe.skip('fillCellsBruteForce', () => {
    test('should match snapshot after processing', () => {
      expect(stringifyGrid(allCellsFilledGrid)).toMatchSnapshot()
    })

    test('should return the original grid if all cells are already filled', () => {
      expect(stringifyGrid(fillCellsBruteForce(allCellsFilledGrid))).toMatchSnapshot()
    })
  })
})

describe.skip('fillCellsBruteForce', () => {
  test('should match snapshot after processing', () => {
    expect(stringifyGrid(allCellsFilledGrid)).toMatchSnapshot()
  })

  test('should return the original grid if all cells are already filled', () => {
    expect(stringifyGrid(fillCellsBruteForce(allCellsFilledGrid))).toMatchSnapshot()
  })
})
