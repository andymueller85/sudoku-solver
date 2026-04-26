import fs from 'fs'
import lodash from 'lodash'
import prompts from 'prompts'
import { rowAndColBoxIntersections } from './boxIntersectionSolver/boxIntersectionSolver'
import { processMatchingSets } from './matchingSetsSolver/matchingSetsSolver'
import { fillBoxes, fillColumns, fillRows } from './cellFillers/cellFillers'
import {
  getFilledCellCount,
  getGridCandidates,
  getCellCandidates,
  gridIsComplete,
  gridIsValid,
  isFilled,
  printGrid,
  seedGrid,
  stringifyGrid
} from './helpers/helpers'
import { Grid, GridWithMeta, CandidatesGrid, EMPTY_CELL } from './types'

const { cloneDeep } = lodash
const DEBUG = false

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
  let count = 0

  // We operate on a single mutable clone for the entire backtracking process
  const myGrid = cloneDeep(grid)

  function recurse(): boolean {
    count++

    let emptyRow = -1
    let emptyCol = -1
    let found = false

    // Find the next empty cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!isFilled(myGrid[r][c])) {
          emptyRow = r
          emptyCol = c
          found = true
          break
        }
      }
      if (found) break
    }

    // If no empty cells are found, the puzzle is solved
    if (!found) {
      return true
    }

    const candidates = getCellCandidates(myGrid, emptyRow, emptyCol)

    for (const candidate of candidates) {
      myGrid[emptyRow][emptyCol] = candidate

      // Recurse deeper
      if (recurse()) {
        return true
      }

      // Backtrack! Undo the move
      myGrid[emptyRow][emptyCol] = EMPTY_CELL
    }

    // If no candidates work, this branch fails
    return false
  }

  recurse()
  return { grid: myGrid, iterations: count }
}

/* istanbul ignore next */
export async function run() {
  while (true) {
    const files = fs.readdirSync('.').filter(f => f.endsWith('.txt'))

    const response = await prompts({
      type: 'select',
      name: 'inputType',
      message: 'How would you like to input the Sudoku puzzle?',
      choices: [
        { title: 'Select a text file', value: 'file' },
        { title: 'Enter an 81-character string', value: 'string' },
        { title: 'Exit', value: 'exit' }
      ]
    })

    let inputData = ''
    let inputName = ''

    if (response.inputType === 'file') {
      const fileResponse = await prompts({
        type: 'select',
        name: 'inputFile',
        message: 'Which file?',
        choices: files.map(file => ({ title: file, value: file }))
      })

      inputName = fileResponse.inputFile

      if (!inputName) {
        return // user cancelled
      }

      inputData = fs.readFileSync(`./${inputName}`, 'utf8')
    } else if (response.inputType === 'string') {
      const stringResponse = await prompts({
        type: 'text',
        name: 'inputString',
        message: 'Enter the 81-character Sudoku string:'
      })

      inputName = 'Manual String Input'
      inputData = stringResponse.inputString

      if (!inputData) {
        return
      }
    } else {
      return // user cancelled or chose exit
    }

    const t1 = Date.now()
    const startingGrid = seedGrid(inputData)
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
    console.log('Logic Iterations:', iterations)
    console.log('After logically filling cells:', getFilledCellCount(logicallyFilledGrid))
    console.log('Logic time:', t2 - t1, 'ms')
    if (recursiveIterations) console.log('Brute force iterations:', recursiveIterations)
    if (t3) console.log('Brute force time:', t3 - t2, 'ms')
    
    console.log('\n-------------------------------------------------------\n')
  }
}
