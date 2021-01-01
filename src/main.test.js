import fs from 'fs'
import { expect } from '@jest/globals'
import * as main from './main.js'
import lodash from 'lodash'

const { cloneDeep } = lodash

const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = main.seedGrid(fileInput)

const firstBoxCompleteGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? `${rowI * 3 + colI + 1}` : c))
)
const { stringifyGrid } = main

describe('Matching sets solver functions', () => {
  describe('findMatches', () => {
    test.todo('findMatches')
  })

  describe('whittlePossibles', () => {
    test.todo('whittlePossibles')
  })

  describe('processRowMatchingSets', () => {
    test.todo('processRowMatchingSets')
  })

  describe('processColumnMatchingSets', () => {
    test.todo('processColumnMatchingSets')
  })

  describe('processBoxMatchingSets', () => {
    test.todo('processBoxMatchingSets')
  })

  describe('processMatchingSets', () => {
    test.todo('processMatchingSets')
  })
})

describe('Box intersection solver functions', () => {
  describe('getImpossibilities', () => {
    test.todo('getImpossibilities')
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

  describe('processBoxIntersections', () => {
    test.todo('processBoxIntersections')
  })

  describe('allBoxIntersections', () => {
    test.todo('allBoxIntersections')
  })

  describe('rowAndColBoxIntersections', () => {
    test.todo('rowAndColBoxIntersections')
  })

  describe('getGridPossibleValues', () => {
    test.todo('getGridPossibleValues')
  })
})

describe('Cell-filling functions - rows and columns', () => {
  describe('cellCanBeDeterminedForRow', () => {
    const { cellCanBeDeterminedForRow } = main
    const gridWithFirstRowOneCellLeft = grid.map((r, rowIndex) =>
      r.map((c, cIndex) => (rowIndex === 0 ? (cIndex > 0 ? `${cIndex + 1}` : '.') : c))
    )

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
      expect(cellCanBeDeterminedForRow(grid, 4, 0, '7')).toBe(true)
    })

    test('should return true if number is only one left for the row', () => {
      expect(cellCanBeDeterminedForRow(gridWithFirstRowOneCellLeft, 0, 0, '1')).toBe(true)
    })

    describe('fillColumns (phil collims?)', () => {
      const { fillColumns } = main

      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillColumns(grid))).toMatchSnapshot()
      })
    })
  })

  describe('fillRows', () => {
    const { fillRows } = main

    test('should match snapshot after one pass', () => {
      expect(stringifyGrid(fillRows(grid))).toMatchSnapshot()
    })
  })
})

describe('Cell-filling functions - boxes', () => {
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

  describe('fillBoxes', () => {
    const { fillBoxes, stringifyGrid } = main

    test('should match snapshot after one pass', () => {
      expect(stringifyGrid(fillBoxes(grid))).toMatchSnapshot()
    })
  })
})

describe('Orchestration functions', () => {
  const fileInputHard = fs.readFileSync('./input_hard.txt', 'utf8')
  const gridHard = main.seedGrid(fileInputHard)

  describe('applyDefinites', () => {
    test.todo('applyDefinites')
  })

  describe('fillCellsLogically', () => {
    const { fillCellsLogically } = main

    test('should match snapshot after processing', () => {
      expect(stringifyGrid(fillCellsLogically(gridHard).grid)).toMatchSnapshot()
    })
  })

  describe.skip('fillCellsBruteForce', () => {
    const logicallyFilledGrid = fillCellsLogically(gridHard).grid
    const allCellsFilledGrid = fillCellsBruteForce(logicallyFilledGrid).grid

    test('should match snapshot after processing', () => {
      expect(stringifyGrid(allCellsFilledGrid)).toMatchSnapshot()
    })

    test('should return the original grid if all cells are already filled', () => {
      expect(stringifyGrid(fillCellsBruteForce(allCellsFilledGrid))).toMatchSnapshot()
    })
  })
})
