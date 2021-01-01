import fs from 'fs'
import { expect } from '@jest/globals'
import * as main from './main.js'
import { seedGrid, stringifyGrid } from './helpers/helpers.js'

const fileInput = fs.readFileSync('./input.txt', 'utf8')


describe('Orchestration functions', () => {
  const fileInputHard = fs.readFileSync('./input_hard.txt', 'utf8')
  const gridHard = seedGrid(fileInputHard)

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
