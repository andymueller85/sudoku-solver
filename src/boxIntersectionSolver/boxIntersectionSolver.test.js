import fs from 'fs'
import { getGridPossibleValues, possibleNums, seedGrid, stringifyGrid } from '../helpers/helpers.js'
import * as boxIntersectionSolver from './boxIntersectionSolver.js'

const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = seedGrid(fileInput)
const possibleValsGrid = getGridPossibleValues(grid)

describe('Box intersection solver functions', () => {
  describe('getImpossibilities', () => {
    const { getImpossibilities } = boxIntersectionSolver

    test('should return all numbers that do not appear in the possible vals array', () => {
      expect(getImpossibilities(['12345'.split(''), '34567'.split('')])).toEqual('89'.split(''))
    })

    test('should work if empty arrays passed', () => {
      expect(getImpossibilities([''.split(''), ''.split('')])).toEqual(possibleNums)
    })

    test('should return empty array if all numbers accounted for', () => {
      expect(getImpossibilities(['12345'.split(''), '3456789'.split('')])).toEqual([])
    })
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
    const { processBoxRowIntersections } = boxIntersectionSolver

    test('should narrow down possibilities for the box, as well as intersecting rows', () => {
      // just printing original grid for comparison
      expect(stringifyGrid(possibleValsGrid)).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  9  |  1  |  6  ❚  4  |  2,5  |  2❚8  |  2,5  |  3  |  7  |
        -------------------------------------------------------------
        |  2  |  3,5  |  4❚ |  5,7,8  |  1,5❚7  |  1,7,8,9  |  6  |  4,5,8  |  4,5,8,9  |
        ---------------------------------------------------------------------------------
        |  5  |  8  |  7  ❚  2,5  |  3  |  6❚ |  1  |  4,5  |  2,4,5,9  |
        =================================================================
        |  3,6,7,8  |  9  ❚  5  |  2,3,6,7  ❚  1,2,4,6,7  |  1,2,4,7  |  2,7  |  7,8  |  1,2,8  |
        -----------------------------------------------------------------------------------------
        |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
        -------------------------------------------------------
        |  3,6,7,8  |  2,3❚6  |  2,6,8  |  2❚3,6,7  |  1,2,6,7  |  1,2,7  |  4  |  9  |  1,2,5,8  |
        ===========================================================================================
        |  5,6  |  5,6  | ❚3  |  1  |  9  | ❚4,7  |  8  |  2  |  4,5  |
        ---------------------------------------------------------------
        |  1,5,6,8  |  2,5❚6  |  9  |  2,5,6❚7,8  |  2,4,5,6,7  |  2,4,7,8  |  5,7  |  4,5,7  |  3  |
        ---------------------------------------------------------------------------------------------
        |  4  |  7  |  2,8❚ |  2,5,8  |  2,5❚ |  3  |  5,9  |  1  |  6  |
        -----------------------------------------------------------------"
      `)

      expect(stringifyGrid(processBoxRowIntersections(possibleValsGrid, 0, 0)))
        .toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  9  |  1  |  6  ❚  4  |  2,5  |  2❚8  |  2,5  |  3  |  7  |
        -------------------------------------------------------------
        |  2  |  3,5  |  4❚ |  5,7,8  |  1,5❚7  |  1,7,8,9  |  6  |  5,8  |  5,8,9  |
        -----------------------------------------------------------------------------
        |  5  |  8  |  7  ❚  2,5  |  3  |  6❚ |  1  |  4,5  |  2,4,5,9  |
        =================================================================
        |  3,6,7,8  |  9  ❚  5  |  2,3,6,7  ❚  1,2,4,6,7  |  1,2,4,7  |  2,7  |  7,8  |  1,2,8  |
        -----------------------------------------------------------------------------------------
        |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
        -------------------------------------------------------
        |  3,6,7,8  |  2,3❚6  |  2,6,8  |  2❚3,6,7  |  1,2,6,7  |  1,2,7  |  4  |  9  |  1,2,5,8  |
        ===========================================================================================
        |  5,6  |  5,6  | ❚3  |  1  |  9  | ❚4,7  |  8  |  2  |  4,5  |
        ---------------------------------------------------------------
        |  1,5,6,8  |  2,5❚6  |  9  |  2,5,6❚7,8  |  2,4,5,6,7  |  2,4,7,8  |  5,7  |  4,5,7  |  3  |
        ---------------------------------------------------------------------------------------------
        |  4  |  7  |  2,8❚ |  2,5,8  |  2,5❚ |  3  |  5,9  |  1  |  6  |
        -----------------------------------------------------------------"
      `)
    })
  })

  describe('allBoxIntersections', () => {
    const { allBoxRowIntersections } = boxIntersectionSolver

    test('should process all box / row intersections for the grid', () => {
      expect(stringifyGrid(allBoxRowIntersections(possibleValsGrid))).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  9  |  1  |  6  ❚  4  |  2,5  |  2❚8  |  2,5  |  3  |  7  |
        -------------------------------------------------------------
        |  2  |  3,5  |  4❚ |  5,7  |  1,5,7❚ |  1,7,9  |  6  |  5,8  |  5,8  |
        -----------------------------------------------------------------------
        |  5  |  8  |  7  ❚  2,5  |  3  |  6❚ |  1  |  4,5  |  2,4,5,9  |
        =================================================================
        |  3,6,8  |  9  | ❚5  |  2,3,6  |  1❚2,4,6  |  1,2,4  |  7  |  7,8  |  1,8  |
        -----------------------------------------------------------------------------
        |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
        -------------------------------------------------------
        |  3,6,8  |  2,3,6❚ |  2,6,8  |  3,6❚7  |  1,6,7  |  1,7  |  4  |  9  |  1,5,8  |
        =================================================================================
        |  5,6  |  5,6  | ❚3  |  1  |  9  | ❚4,7  |  8  |  2  |  4,5  |
        ---------------------------------------------------------------
        |  1,5,8  |  2,5  ❚  9  |  2,5,6,8  ❚  2,4,5,6  |  2,4,8  |  5,7  |  4,5,7  |  3  |
        -----------------------------------------------------------------------------------
        |  4  |  7  |  2,8❚ |  2,5,8  |  2,5❚ |  3  |  5,9  |  1  |  6  |
        -----------------------------------------------------------------"
      `)
    })
  })

  describe('rowAndColBoxIntersections', () => {
    const { rowAndColBoxIntersections } = boxIntersectionSolver

    test('should process all box intersections for all rows and columns', () => {
      expect(stringifyGrid(rowAndColBoxIntersections(possibleValsGrid))).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  9  |  1  |  6  ❚  4  |  2,5  |  2❚8  |  2,5  |  3  |  7  |
        -------------------------------------------------------------
        |  2  |  3,5  |  4❚ |  5,7  |  1,5,7❚ |  1,9  |  6  |  5,8  |  8  |
        -------------------------------------------------------------------
        |  5  |  8  |  7  ❚  2,5  |  3  |  6❚ |  1  |  4,5  |  4,9  |
        =============================================================
        |  3,6,8  |  9  | ❚5  |  2,3,6  |  1❚2,4,6  |  1,2,4  |  7  |  7,8  |  1,8  |
        -----------------------------------------------------------------------------
        |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
        -------------------------------------------------------
        |  3,6,8  |  2,6  ❚  2,8  |  3,6,7  ❚  1,6,7  |  1  |  4  |  9  |  1,5,8  |
        ===========================================================================
        |  5,6  |  5,6  | ❚3  |  1  |  9  | ❚4,7  |  8  |  2  |  4  |
        -------------------------------------------------------------
        |  1,5,8  |  2,5  ❚  9  |  2,5,6,8  ❚  2,4,5,6  |  2,4  |  5,7  |  4,5,7  |  3  |
        ---------------------------------------------------------------------------------
        |  4  |  7  |  2,8❚ |  2,5,8  |  2,5❚ |  3  |  5,9  |  1  |  6  |
        -----------------------------------------------------------------"
      `)
    })
  })
})
