import fs from 'fs'
import { expect } from '@jest/globals'
import * as main from './main'
import { getGridPossibleValues, seedGrid, stringifyGrid } from './helpers/helpers'
import { rowAndColBoxIntersections } from './boxIntersectionSolver/boxIntersectionSolver'
import { applyDefinites } from './main'

const fileInputHard = fs.readFileSync('./input_hard.txt', 'utf8')
const gridHard = seedGrid(fileInputHard)

const fileInput = fs.readFileSync('./input.txt', 'utf8')
const grid = seedGrid(fileInput)

describe('Orchestration functions', () => {
  describe('applyDefinites', () => {
    const { applyDefinites } = main

    test('should populate grid where there is only one possibility for a cell', () => {
      const possibleVals = getGridPossibleValues(gridHard)

      expect(stringifyGrid(applyDefinites(gridHard, possibleVals))).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |     |     |     ❚     |  9  |  6  ❚     |  7  |     |
        -------------------------------------------------------
        |     |     |  4  ❚     |     |     ❚     |     |  9  |
        -------------------------------------------------------
        |     |     |     ❚     |  1  |  5  ❚  4  |     |     |
        =======================================================
        |     |     |     ❚     |     |  9  ❚     |  4  |  8  |
        -------------------------------------------------------
        |     |  6  |  1  ❚     |  3  |     ❚  5  |  2  |     |
        -------------------------------------------------------
        |  8  |  4  |     ❚  7  |     |     ❚     |     |     |
        =======================================================
        |     |     |  2  ❚  5  |  4  |     ❚     |     |     |
        -------------------------------------------------------
        |  7  |     |     ❚     |     |  2  ❚  3  |     |     |
        -------------------------------------------------------
        |     |  5  |     ❚  1  |  8  |     ❚     |     |     |
        -------------------------------------------------------"
      `)
    })
  })

  describe('fillCellsLogically', () => {
    const { fillCellsLogically } = main

    test('should match snapshot after processing', () => {
      expect(stringifyGrid(fillCellsLogically(gridHard).grid)).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  1  |  8  |  3  ❚  4  |  9  |  6  ❚  2  |  7  |  5  |
        -------------------------------------------------------
        |  5  |  2  |  4  ❚  3  |  7  |  8  ❚  6  |  1  |  9  |
        -------------------------------------------------------
        |  6  |  7  |  9  ❚  2  |  1  |  5  ❚  4  |  8  |  3  |
        =======================================================
        |  2  |  3  |  7  ❚  6  |  5  |  9  ❚  1  |  4  |  8  |
        -------------------------------------------------------
        |  9  |  6  |  1  ❚  8  |  3  |  4  ❚  5  |  2  |  7  |
        -------------------------------------------------------
        |  8  |  4  |  5  ❚  7  |  2  |  1  ❚  9  |  3  |  6  |
        =======================================================
        |  3  |  9  |  2  ❚  5  |  4  |  7  ❚  8  |  6  |  1  |
        -------------------------------------------------------
        |  7  |  1  |  8  ❚  9  |  6  |  2  ❚  3  |  5  |  4  |
        -------------------------------------------------------
        |  4  |  5  |  6  ❚  1  |  8  |  3  ❚  7  |  9  |  2  |
        -------------------------------------------------------"
      `)
    })
  })

  describe('fillCellsBruteForce', () => {
    const { fillCellsBruteForce } = main

    const possibleValsGrid = rowAndColBoxIntersections(getGridPossibleValues(grid))
    const partiallySolvedGrid = applyDefinites(grid, possibleValsGrid)

    // just printing for reference
    expect(stringifyGrid(partiallySolvedGrid)).toMatchInlineSnapshot(`
      "-------------------------------------------------------
      |  9  |  1  |  6  ❚  4  |     |     ❚     |  3  |  7  |
      -------------------------------------------------------
      |  2  |     |  4  ❚     |     |     ❚  6  |     |  8  |
      -------------------------------------------------------
      |  5  |  8  |  7  ❚     |  3  |  6  ❚  1  |     |     |
      =======================================================
      |     |  9  |  5  ❚     |     |     ❚  7  |     |     |
      -------------------------------------------------------
      |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
      -------------------------------------------------------
      |     |     |     ❚     |     |  1  ❚  4  |  9  |     |
      =======================================================
      |     |     |  3  ❚  1  |  9  |     ❚  8  |  2  |  4  |
      -------------------------------------------------------
      |     |     |  9  ❚     |     |     ❚     |     |  3  |
      -------------------------------------------------------
      |  4  |  7  |     ❚     |     |  3  ❚     |  1  |  6  |
      -------------------------------------------------------"
    `)

    const allCellsFilledGrid = fillCellsBruteForce(partiallySolvedGrid).grid

    test('should be solved and match snapshot after processing', () => {
      expect(stringifyGrid(allCellsFilledGrid!)).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  9  |  1  |  6  ❚  4  |  5  |  8  ❚  2  |  3  |  7  |
        -------------------------------------------------------
        |  2  |  3  |  4  ❚  7  |  1  |  9  ❚  6  |  5  |  8  |
        -------------------------------------------------------
        |  5  |  8  |  7  ❚  2  |  3  |  6  ❚  1  |  4  |  9  |
        =======================================================
        |  3  |  9  |  5  ❚  6  |  4  |  2  ❚  7  |  8  |  1  |
        -------------------------------------------------------
        |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
        -------------------------------------------------------
        |  8  |  6  |  2  ❚  3  |  7  |  1  ❚  4  |  9  |  5  |
        =======================================================
        |  6  |  5  |  3  ❚  1  |  9  |  7  ❚  8  |  2  |  4  |
        -------------------------------------------------------
        |  1  |  2  |  9  ❚  8  |  6  |  4  ❚  5  |  7  |  3  |
        -------------------------------------------------------
        |  4  |  7  |  8  ❚  5  |  2  |  3  ❚  9  |  1  |  6  |
        -------------------------------------------------------"
      `)
    })

    test('should return the original grid if all cells are already filled', () => {
      expect(stringifyGrid(fillCellsBruteForce(allCellsFilledGrid!).grid!)).toMatchInlineSnapshot(`
        "-------------------------------------------------------
        |  9  |  1  |  6  ❚  4  |  5  |  8  ❚  2  |  3  |  7  |
        -------------------------------------------------------
        |  2  |  3  |  4  ❚  7  |  1  |  9  ❚  6  |  5  |  8  |
        -------------------------------------------------------
        |  5  |  8  |  7  ❚  2  |  3  |  6  ❚  1  |  4  |  9  |
        =======================================================
        |  3  |  9  |  5  ❚  6  |  4  |  2  ❚  7  |  8  |  1  |
        -------------------------------------------------------
        |  7  |  4  |  1  ❚  9  |  8  |  5  ❚  3  |  6  |  2  |
        -------------------------------------------------------
        |  8  |  6  |  2  ❚  3  |  7  |  1  ❚  4  |  9  |  5  |
        =======================================================
        |  6  |  5  |  3  ❚  1  |  9  |  7  ❚  8  |  2  |  4  |
        -------------------------------------------------------
        |  1  |  2  |  9  ❚  8  |  6  |  4  ❚  5  |  7  |  3  |
        -------------------------------------------------------
        |  4  |  7  |  8  ❚  5  |  2  |  3  ❚  9  |  1  |  6  |
        -------------------------------------------------------"
      `)
    })
  })
})