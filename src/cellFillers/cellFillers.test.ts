import fs from 'fs'
import lodash from 'lodash'
import { seedGrid, stringifyGrid } from '../helpers/helpers'
import { EMPTY_CELL, SudokuNumber } from '../types'
import * as cellFillers from './cellFillers'

const { cloneDeep } = lodash
const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = seedGrid(fileInput)

const firstBoxCompleteGrid = grid.map((r, rowI) =>
  r.map((c, colI) => (rowI < 3 && colI < 3 ? (`${rowI * 3 + colI + 1}` as SudokuNumber) : c))
)

describe('Cell-filling functions - rows and columns', () => {
  describe('cellCanBeDeterminedForRow', () => {
    const { cellCanBeDeterminedForRow } = cellFillers
    const gridWithFirstRowOneCellLeft = grid.map((r, rowIndex) =>
      r.map((c, cIndex) =>
        rowIndex === 0 ? (cIndex > 0 ? (`${cIndex + 1}` as SudokuNumber) : EMPTY_CELL) : c
      )
    )

    test('should return false if the box already contains the number', () => {
      expect(cellCanBeDeterminedForRow(grid, 1, 1, SudokuNumber.SEVEN)).toBe(false)
    })

    test('should return false if the number is already in the current row', () => {
      expect(cellCanBeDeterminedForRow(grid, 1, 2, SudokuNumber.SIX)).toBe(false)
    })

    test('should return false if there is a column that does not contain the number ', () => {
      expect(cellCanBeDeterminedForRow(grid, 2, 0, SudokuNumber.FIVE)).toBe(false)
    })

    test('should return false if the box already includes the number', () => {
      expect(cellCanBeDeterminedForRow(grid, 1, 4, SudokuNumber.FOUR)).toBe(false)
    })

    test('should return true if every other empty cell column contains the number - X axis', () => {
      expect(cellCanBeDeterminedForRow(grid, 4, 0, SudokuNumber.SEVEN)).toBe(true)
    })

    test('should return true if number is only one left for the row', () => {
      expect(cellCanBeDeterminedForRow(gridWithFirstRowOneCellLeft, 0, 0, SudokuNumber.ONE)).toBe(
        true
      )
    })

    describe('fillColumns (phil collims?)', () => {
      const { fillColumns } = cellFillers

      test('should match snapshot after one pass', () => {
        expect(stringifyGrid(fillColumns(grid))).toMatchSnapshot()
      })
    })
  })

  describe('fillRows', () => {
    const { fillRows } = cellFillers

    test('should match snapshot after one pass', () => {
      expect(stringifyGrid(fillRows(grid))).toMatchSnapshot()
    })
  })
})

describe('Cell-filling functions - boxes', () => {
  describe('cellCanBeDeterminedForBox', () => {
    const { cellCanBeDeterminedForBox } = cellFillers
    const firstBoxOneCellEmptyGrid = cloneDeep(firstBoxCompleteGrid)
    firstBoxOneCellEmptyGrid[0][0] = EMPTY_CELL
    const firstBoxFirstTwoCellsEmptyGrid = cloneDeep(firstBoxCompleteGrid)
    firstBoxFirstTwoCellsEmptyGrid[0][0] = EMPTY_CELL
    firstBoxFirstTwoCellsEmptyGrid[0][1] = EMPTY_CELL

    // cases are mostly tested by checkCellAGainstOtherAxis tests, just test a couple cases here.
    test('should return true if number is only one left for the box', () => {
      expect(cellCanBeDeterminedForBox(firstBoxOneCellEmptyGrid, 0, 0, 0, SudokuNumber.ONE)).toBe(
        true
      )
    })

    test('should return false if not', () => {
      expect(
        cellCanBeDeterminedForBox(firstBoxFirstTwoCellsEmptyGrid, 0, 0, 0, SudokuNumber.ONE)
      ).toBe(false)
    })
  })

  describe('fillBoxes', () => {
    const { fillBoxes } = cellFillers

    test('should match snapshot after one pass', () => {
      expect(stringifyGrid(fillBoxes(grid))).toMatchSnapshot()
    })
  })
})
