import fs from 'fs'
import lodash from 'lodash'
import { rowAndColBoxIntersections } from './boxIntersectionSolver/boxIntersectionSolver.js'
import { processMatchingSets } from './matchingSetsSolver/matchingSetsSolver.js'
import { fillBoxes, fillColumns, fillRows } from './cellFillers/cellFillers.js'
import {
  getFilledCellCount,
  getGridPossibleValues,
  getNextEmptyCellCoordinates,
  getPossibleCellValues,
  gridHasAnyDeadEnds,
  gridIsComplete,
  gridIsValid,
  GRID_SIZE,
  isFilled,
  printGrid,
  seedGrid,
  stringifyGrid
} from './helpers/helpers.js'

const { cloneDeep } = lodash
const DEBUG = false

const inputName = 'input_evil.txt'
const fileInput = fs.readFileSync(`./${inputName}`, 'utf8')

/* istanbul ignore next */
function log(grid, loopCount, msg) {
  if (DEBUG) {
    console.log(`Pass ${loopCount} ${msg}`)
    console.log(`${stringifyGrid(grid)}\n\n`)
  }
}

export function applyDefinites(grid, possibleValsGrid) {
  let myGrid = cloneDeep(grid)

  possibleValsGrid.forEach((r, rIdx) =>
    r.forEach((c, cIdx) => {
      if (!isFilled(myGrid[rIdx][cIdx])) {
        if (c.length === 1) myGrid[rIdx][cIdx] = c[0]
      }
    })
  )

  return myGrid
}

//************** orchestration ****************/
export function fillCellsLogically(grid) {
  let updatedGrid = cloneDeep(grid)
  let prevFilledCellCount = 0
  let filledCellCount = getFilledCellCount(updatedGrid)
  let loopCount = 0

  while (filledCellCount > prevFilledCellCount && !gridIsComplete(updatedGrid)) {
    loopCount++
    prevFilledCellCount = filledCellCount

    updatedGrid = fillBoxes(updatedGrid)
    log(updatedGrid, loopCount, '- Boxes')
    updatedGrid = fillRows(updatedGrid)
    log(updatedGrid, loopCount, '- Rows')
    updatedGrid = fillColumns(updatedGrid)
    log(updatedGrid, loopCount, '- Columns')

    let possibleValsGrid = getGridPossibleValues(updatedGrid)
    updatedGrid = applyDefinites(updatedGrid, possibleValsGrid)

    possibleValsGrid = processMatchingSets(possibleValsGrid)
    updatedGrid = applyDefinites(updatedGrid, possibleValsGrid)

    possibleValsGrid = rowAndColBoxIntersections(possibleValsGrid)
    updatedGrid = applyDefinites(updatedGrid, possibleValsGrid)


    /* istanbul ignore next */
    if (!gridIsValid(updatedGrid)) {
      printGrid(updatedGrid)
      throw 'uh-oh'
    }

    filledCellCount = getFilledCellCount(updatedGrid)
  }

  return { grid: updatedGrid, iterations: loopCount }
}

export function fillCellsBruteForce(grid) {
  if (gridIsComplete(grid)) return grid
  let finalGrid = undefined
  let count = 0

  function recurse(myGrid, curRow = 0, curCol = 0) {
    count++
    // if (count % 10000 === 0) {
    //   console.log(count)
    //   console.log(stringifyGrid(myGrid))
    // }
    const curGrid = cloneDeep(myGrid)

    for (let rowNum = curRow; rowNum < GRID_SIZE; rowNum++) {
      for (let colNum = rowNum === curRow ? curCol : 0; colNum < GRID_SIZE; colNum++) {
        if (!isFilled(curGrid[rowNum][colNum])) {
          if (gridHasAnyDeadEnds(curGrid)) {
            return
          }

          const cellPossibles = getPossibleCellValues(curGrid, rowNum, colNum)

          cellPossibles.forEach(possibleNum => {
            curGrid[rowNum][colNum] = possibleNum

            const nextCoordinates = getNextEmptyCellCoordinates(grid, rowNum, colNum)

            if (!nextCoordinates) finalGrid = curGrid

            if (!finalGrid) {
              const [nextRowNum, nextColNum] = nextCoordinates
              recurse(curGrid, nextRowNum, nextColNum)
            }
          })
        }
      }
    }
  }

  recurse(grid)
  return { grid: finalGrid, recursiveIterations: count }
}

/* istanbul ignore next */
export function run() {
  const t1 = Date.now()
  const startingGrid = seedGrid(fileInput)
  console.log('Input Name:', inputName)
  console.log('\nStarting Grid')
  printGrid(startingGrid)

  const { grid: logicallyFilledGrid, iterations } = fillCellsLogically(startingGrid)
  console.log('\nAfter logically filling cells:')
  printGrid(logicallyFilledGrid)
  const t2 = Date.now()

  let recursiveIterations = undefined
  let t3 = undefined
  if (gridIsComplete(logicallyFilledGrid)) {
    console.log('\n😎🧩 Puzzle Solved 🧩😎')
  } else {
    console.log('\n🕵️‍♀️🧩 Still some work to do... 🧩🕵️‍♀️')
    const bruteForceResults = fillCellsBruteForce(logicallyFilledGrid)
    const finalGrid = bruteForceResults.grid
    recursiveIterations = finalGrid.recursiveIterations
    console.log('\nAfter brute force recursion')
    printGrid(finalGrid)
    t3 = Date.now()
  }

  console.log('\nStats:')
  console.log('Starting boxes:', getFilledCellCount(startingGrid))
  console.log('Logic Iterations', iterations)
  console.log('After logically filling cells:', getFilledCellCount(logicallyFilledGrid))
  console.log('Logic time:', t2 - t1, 'ms')
  if (recursiveIterations) console.log('Brute force iterations:', recursiveIterations)
  if (t3) console.log('Brute force time:', t3 - t2, 'ms')
}
