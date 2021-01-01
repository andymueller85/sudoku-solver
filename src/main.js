import fs from 'fs'
import lodash from 'lodash'
import {
  allIndexes,
  arrayIntersection,
  boxIndexes,
  columnNeighborsAreFilled,
  columnNeighborsContainNumber,
  flattenBox,
  flattenBoxes,
  getBoxCurColumn,
  getBoxCurRow,
  getBoxMissingCells,
  getBoxMissingNums,
  getBoxTopLeft,
  getColumnFilledNums,
  getColumnMissingNums,
  getFilledCellCount,
  getMissingNums,
  getNextEmptyCellCoordinates,
  getPossibleCellValues,
  getRowMissingCells,
  getRowMissingNums,
  getUniqueArrays,
  gridHasAnyDeadEnds,
  gridIsComplete,
  gridIsValid,
  GRID_SIZE,
  isFilled,
  possibleNums,
  rowNeighborsAreFilled,
  rowNeighborsContainNumber,
  swapXY,
  unflattenBoxes
} from './helpers.js'

const { cloneDeep } = lodash
const DEBUG = false

const inputName = 'input_evil.txt'
const fileInput = fs.readFileSync(`./${inputName}`, 'utf8')

export function seedGrid(input) {
  return input
    .split(/\r?\n/)
    .filter(r => r)
    .map(r => [...r].map(c => c))
}

export const miniGridIndexes = [0, 1, 2]

/************** cell-filling fns - rows & cols ****************/
export function cellCanBeDeterminedForRow(grid, rowNum, colNum, num) {
  const rowMissingNums = getMissingNums(grid[rowNum])
  const columnMissingNums = getColumnMissingNums(grid, colNum)

  return (
    (rowMissingNums.length === 1 && rowMissingNums[0] === num) ||
    (rowMissingNums.includes(num) &&
      columnMissingNums.includes(num) &&
      getRowMissingCells(grid, rowNum)
        .filter(cell => cell !== colNum)
        .every(v => getColumnFilledNums(grid, v).includes(num)) &&
      getBoxMissingNums(grid, getBoxTopLeft(rowNum), getBoxTopLeft(colNum)).includes(num))
  )
}

export function fillRows(grid) {
  let myGrid = cloneDeep(grid)

  myGrid.forEach((_, rowNum) => {
    getRowMissingNums(myGrid, rowNum).forEach(n => {
      getRowMissingCells(myGrid, rowNum).forEach(colNum => {
        if (cellCanBeDeterminedForRow(myGrid, rowNum, colNum, n)) {
          myGrid[rowNum][colNum] = n
        }
      })
    })
  })

  return myGrid
}

// aka Phil Collims
export function fillColumns(grid) {
  return swapXY(fillRows(swapXY(grid)))
}

/************** cell-filling fns - boxes ****************/
export function cellCanBeDeterminedForBox(grid, cell, topLeftRow, topLeftCol, num) {
  const curRow = getBoxCurRow(topLeftRow, cell)
  const curCol = getBoxCurColumn(topLeftCol, cell)
  const rNeighborsFilled = rowNeighborsAreFilled(grid, topLeftCol, curRow, curCol)
  const rNeighborsContainNum = rowNeighborsContainNumber(grid, topLeftRow, curRow, num)
  const cNeighborsAreFilled = columnNeighborsAreFilled(grid, topLeftRow, curRow, curCol)
  const cNeighborsContainNum = columnNeighborsContainNumber(grid, topLeftCol, curCol, num)
  const boxMissingNums = getBoxMissingNums(grid, topLeftRow, topLeftCol)

  return (
    // this is the only missing number - we're done.
    (boxMissingNums.length === 1 && boxMissingNums[0] === num) ||
    // bail if number is already in the box, row, or column
    (boxMissingNums.includes(num) &&
      getRowMissingNums(grid, curRow).includes(num) &&
      getColumnMissingNums(grid, curCol).includes(num) &&
      // Both other column cells in box are determined and both other complete columns have the number
      ((cNeighborsAreFilled && cNeighborsContainNum) ||
        // Both other row cells in box are determined and both other complete rows have the number
        (rNeighborsFilled && rNeighborsContainNum) ||
        // Both other complete rows and both other complete columns have the number
        (rNeighborsContainNum && cNeighborsContainNum)))
  )
}

export function fillBoxes(grid) {
  // TODO: it would probably be cleaner to flatten the boxes
  let myGrid = cloneDeep(grid)

  for (let topLeftRow = 0; topLeftRow < myGrid.length; topLeftRow += 3) {
    for (let topLeftCol = 0; topLeftCol < myGrid[0].length; topLeftCol += 3) {
      getBoxMissingNums(myGrid, topLeftRow, topLeftCol).forEach(n => {
        getBoxMissingCells(myGrid, topLeftRow, topLeftCol).forEach(cell => {
          const curRow = getBoxCurRow(topLeftRow, cell)
          const curColumn = getBoxCurColumn(topLeftCol, cell)

          if (cellCanBeDeterminedForBox(myGrid, cell, topLeftRow, topLeftCol, n))
            myGrid[curRow][curColumn] = n
        })
      })
    }
  }

  return myGrid
}

/* istanbul ignore next */
function log(grid, loopCount, msg) {
  if (DEBUG) {
    console.log(`Pass ${loopCount} ${msg}`)
    console.log(`${stringifyGrid(grid)}\n\n`)
  }
}

/************** matching sets solver fns ****************/
// TODO: matching sets functions need tests
export function findMatches(arr) {
  return arr.map((c, arrIdx, cells) => ({
    possibles: c,
    matches: cells
      .map((vals, idx) => ({ vals, idx }))
      .filter(
        cell =>
          arrIdx !== cell.idx &&
          cell.vals.length === c.length &&
          cell.vals.every((v, i) => v === c[i])
      )
      .map(({ idx }) => idx)
  }))
}

function whittlePossibles(matches, possiblesGrid) {
  let possibleValsGrid = cloneDeep(possiblesGrid)

  for (let n = 2; n < GRID_SIZE; n++) {
    matches.forEach((m, rowIdx) => {
      const matchesOfSizeN = m.filter(r => r.matches.length > 0 && r.possibles.length === n)

      if (matchesOfSizeN.length === n) {
        const matchingSets = getUniqueArrays(...matchesOfSizeN.map(m => m.possibles))

        matchingSets.forEach(possibles => {
          const setIndexes = [...new Set(matchesOfSizeN.map(m => m.matches).flat())]

          allIndexes
            .filter(n => !setIndexes.includes(n))
            .forEach(colIdx => {
              possibleValsGrid[rowIdx][colIdx] = possibleValsGrid[rowIdx][colIdx].filter(
                (v, _, a) => n > a.length || !possibles.includes(v)
              )
            })
        })
      }
    })
  }

  return possibleValsGrid
}

export function processRowMatchingSets(possibleValsGrid) {
  return whittlePossibles(possibleValsGrid.map(findMatches), possibleValsGrid)
}

export function processColumnMatchingSets(possibleValsGrid) {
  const swappedGrid = swapXY(possibleValsGrid)
  const columnMatches = swappedGrid.map(findMatches)

  return swapXY(whittlePossibles(columnMatches, swappedGrid))
}

export function processBoxMatchingSets(possibleValsGrid) {
  const flattenedBoxGrid = flattenBoxes(possibleValsGrid)
  const boxMatches = flattenedBoxGrid.map(findMatches)

  return unflattenBoxes(whittlePossibles(boxMatches, flattenedBoxGrid))
}

export function processMatchingSets(possibleValsGrid) {
  let myGrid = processBoxMatchingSets(possibleValsGrid)
  myGrid = processColumnMatchingSets(myGrid)
  myGrid = processRowMatchingSets(myGrid)

  return myGrid
}

/************** box intersections solver fns ****************/
export function getImpossibilities(arr) {
  return possibleNums.filter(
    p => ![...new Set(arr.reduce((acc, cur) => acc.concat(cur)))].includes(p)
  )
}

export function getOtherIndexes(i) {
  return allIndexes.filter(p => p < i * 3 || p > i * 3 + 2)
}

export function processBoxIntersections(possibleValsGrid, topLeftRowNum, topLeftColNum) {
  let myGrid = cloneDeep(possibleValsGrid)
  const flatBox = flattenBox(myGrid, topLeftRowNum, topLeftColNum)

  miniGridIndexes.forEach(i => {
    const row = myGrid[topLeftRowNum + i]
    const boxOtherIndexes = getOtherIndexes(i)
    const outsideOtherIndexes = getOtherIndexes(topLeftColNum / 3)
    const outsideBoxImpossibilities = getImpossibilities(outsideOtherIndexes.map(i => row[i]))
    const insideBoxImpossibilities = getImpossibilities(boxOtherIndexes.map(i => flatBox[i]))

    boxOtherIndexes.forEach(idx => {
      const gridRow = getBoxCurRow(topLeftRowNum, idx)
      const gridCol = getBoxCurColumn(topLeftColNum, idx)

      myGrid[gridRow][gridCol] = flatBox[idx].filter(n => !outsideBoxImpossibilities.includes(n))
    })

    outsideOtherIndexes.forEach(idx => {
      myGrid[topLeftRowNum + i][idx] = row[idx].filter(n => !insideBoxImpossibilities.includes(n))
    })
  })

  return myGrid
}

export function allBoxIntersections(possibleValsGrid) {
  let myGrid = cloneDeep(possibleValsGrid)

  boxIndexes.forEach(r => {
    boxIndexes.forEach(c => {
      myGrid = processBoxIntersections(myGrid, r, c)
    })
  })

  return myGrid
}

export function rowAndColBoxIntersections(possibleValsGrid) {
  let myGrid = cloneDeep(possibleValsGrid)

  myGrid = allBoxIntersections(myGrid)
  myGrid = swapXY(allBoxIntersections(swapXY(myGrid)))

  return myGrid
}

export function getGridPossibleValues(grid) {
  return grid.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (isFilled(c)) return [c]

      const rowMissingNums = getRowMissingNums(grid, rIdx)
      const colMissingNums = getColumnMissingNums(grid, cIdx)
      const boxMissingNums = getBoxMissingNums(grid, getBoxTopLeft(rIdx), getBoxTopLeft(cIdx))

      return arrayIntersection(rowMissingNums, colMissingNums, boxMissingNums)
    })
  )
}

/************** orchestration ****************/

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
      let colNum = rowNum === curRow ? curCol : 0
      for (; colNum < GRID_SIZE; colNum++) {
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

export function stringifyGrid(grid) {
  const vertSeparator = '|'
  const innerSeparator = `  ${vertSeparator}  `
  const rowBegin = `${vertSeparator}  `
  const rowEnd = `  ${vertSeparator}`
  const pad = rowBegin.length + rowEnd.length
  const horSeparator = '-'
  const boxSeparatorVert = String.fromCharCode(parseInt('275A', 16))
  const boxSeparatorHor = '='

  function replaceCharAt(str, i, char) {
    return str.substring(0, i) + char + str.substring(i + 1)
  }

  let strGrid = horSeparator.repeat((GRID_SIZE - 1) * innerSeparator.length + GRID_SIZE + pad)

  for (let row = 0; row < GRID_SIZE; row++) {
    let logStr = grid[row].map(c => (isFilled(c) ? c : ' ')).join(innerSeparator)

    logStr = replaceCharAt(logStr, 15, boxSeparatorVert)
    logStr = replaceCharAt(logStr, 33, boxSeparatorVert)

    strGrid += `\n${rowBegin}${logStr}${rowEnd}\n`
    strGrid += ([2, 5].includes(row) ? boxSeparatorHor : horSeparator).repeat(logStr.length + pad)
  }

  return strGrid
}

/* istanbul ignore next */
export function printGrid(grid) {
  console.log(stringifyGrid(grid))
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
