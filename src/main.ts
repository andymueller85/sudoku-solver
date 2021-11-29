import fs from 'fs'
import lodash from 'lodash'
import { rowAndColBoxIntersections } from './boxIntersectionSolver/boxIntersectionSolver'
import { processMatchingSets } from './matchingSetsSolver/matchingSetsSolver'
import { fillBoxes, fillColumns, fillRows } from './cellFillers/cellFillers'
import {
  getFilledCellCount,
  getGridCandidates,
  getNextEmptyCellCoordinates,
  getCellCandidates,
  gridHasAnyDeadEnds,
  gridIsComplete,
  gridIsValid,
  isFilled,
  printGrid,
  seedGrid,
  stringifyGrid
} from './helpers/helpers'
import { Grid, GridWithMeta, CandidatesGrid } from './types'

const { cloneDeep } = lodash
const DEBUG = false

const inputName = 'input_4.txt'
const fileInput = fs.readFileSync(`./${inputName}`, 'utf8')

/* istanbul ignore next */
function log(grid: Grid, loopCount: number, msg: string) {
  if (DEBUG) {
    console.log(`Pass ${loopCount} ${msg}`)
    console.log(`${stringifyGrid(grid)}\n\n`)
  }
}

export function applyDefinites(grid: Grid, candidatesGrid: CandidatesGrid) {
  let myGrid = cloneDeep(grid)

  candidatesGrid.forEach((r, rIdx) =>
    r.forEach((c, cIdx) => {
      if (!isFilled(myGrid[rIdx][cIdx])) {
        if (c.length === 1) myGrid[rIdx][cIdx] = c[0]
      }
    })
  )

  return myGrid
}

//************** orchestration ****************/
export function fillCellsLogically(grid: Grid): GridWithMeta {
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

    let candidatesGrid = getGridCandidates(updatedGrid)
    updatedGrid = applyDefinites(updatedGrid, candidatesGrid)

    candidatesGrid = processMatchingSets(candidatesGrid)
    updatedGrid = applyDefinites(updatedGrid, candidatesGrid)

    candidatesGrid = rowAndColBoxIntersections(candidatesGrid)
    updatedGrid = applyDefinites(updatedGrid, candidatesGrid)

    /* istanbul ignore next */
    if (!gridIsValid(updatedGrid)) {
      printGrid(updatedGrid)
      throw new Error('uh-oh')
    }

    filledCellCount = getFilledCellCount(updatedGrid)
  }

  return { grid: updatedGrid, iterations: loopCount }
}

export function fillCellsBruteForce(grid: Grid): GridWithMeta {
  if (gridIsComplete(grid)) return { grid, iterations: 0 }
  let finalGrid: Grid | undefined = undefined
  let count = 0

  function goToNext(g: Grid, r: number, c: number): void {
    const nextCoordinates = getNextEmptyCellCoordinates(g, r, c)

    if (!nextCoordinates) {
      finalGrid = g
    } else if (!finalGrid) {
      recurse(g, nextCoordinates[0], nextCoordinates[1])
    }
  }

  function recurse(myGrid: Grid, curRow: number = 0, curCol: number = 0): void {
    /* istanbul ignore next */
    if (++count % 1000 === 0) console.log(`\n${count}`, `\n${stringifyGrid(myGrid)}`)
    const curGrid = cloneDeep(myGrid)

    if (!isFilled(curGrid[curRow][curCol])) {
      getCellCandidates(curGrid, curRow, curCol).forEach(candidate => {
        curGrid[curRow][curCol] = candidate

        if (!gridHasAnyDeadEnds(curGrid)) {
          goToNext(curGrid, curRow, curCol)
        }
      })
    } else {
      goToNext(curGrid, curRow, curCol)
    }
  }

  recurse(grid)
  return { grid: finalGrid || grid, iterations: count }
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
    recursiveIterations = bruteForceResults.iterations
    console.log('\nAfter brute force recursion')
    finalGrid && printGrid(finalGrid)
    console.log('\n😎🧩 Puzzle Solved 🧩😎')
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
