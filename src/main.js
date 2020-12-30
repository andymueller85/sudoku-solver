import fs from 'fs'
import lodash from 'lodash'

const { cloneDeep } = lodash
const GRID_SIZE = 9
const EMPTY_CELL = '.'
const DEBUG = false

const fileInput = fs.readFileSync('./input_very_hard.txt', 'utf8')

export function seedGrid(input) {
  return input
    .split(/\r?\n/)
    .filter(r => r)
    .map(r => [...r].map(c => c))
}

export const possibleNums = '123456789'.split('')
export const allIndexes = Array.from({ length: GRID_SIZE }, (_, i) => i)
export const boxIndexes = [0, 3, 6]
export const axis = { x: 'X', y: 'Y' }

export function isFilled(cell) {
  return cell !== EMPTY_CELL
}

export function getArrayMissingCells(arr) {
  return arr
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !isFilled(cell))
    .map(({ index }) => index)
}

export function rowIsComplete(grid, rowNum) {
  return grid[rowNum].every(c => isFilled(c))
}

export function rowIsValid(grid, rowNum) {
  return (
    JSON.stringify(
      [
        ...getRowFilledNums(grid, rowNum),
        ...getRowMissingNums(grid, rowNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

export function everyRowIsValid(grid) {
  return grid.every((_, rowNum) => rowIsValid(grid, rowNum))
}

export function getRowFilledNums(grid, rowNum) {
  return grid[rowNum].filter(c => isFilled(c))
}

export function getRowMissingNums(grid, rowNum) {
  const FilledNums = getRowFilledNums(grid, rowNum)
  return possibleNums.filter(n => !FilledNums.includes(n))
}

export function getRowMissingCells(grid, rowNum) {
  return getArrayMissingCells(grid[rowNum])
}

export function columnIsComplete(grid, columnNum) {
  return grid.map(r => r[columnNum]).every(c => isFilled(c))
}

export function columnIsValid(grid, colNum) {
  return (
    JSON.stringify(
      [
        ...getColumnFilledNums(grid, colNum),
        ...getColumnMissingNums(grid, colNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

export function everyColumnIsValid(grid) {
  for (let col = 0; col < GRID_SIZE; col++) {
    if (!columnIsValid(grid, col)) return false
  }
  return true
}

export function getColumnFilledNums(grid, columnNum) {
  return grid.map(r => r[columnNum]).filter(c => isFilled(c))
}

export function getColumnMissingNums(grid, columnNum) {
  const filledNums = getColumnFilledNums(grid, columnNum)
  return possibleNums.filter(n => !filledNums.includes(n))
}

export function getColumnMissingCells(grid, columnNum) {
  return getArrayMissingCells(grid.map(r => r[columnNum]))
}

export function getBoxTopLeft(rowOrCol) {
  return rowOrCol - (rowOrCol % 3)
}

export function getBoxCurRow(topLeftRow, cell) {
  return topLeftRow + Math.floor(cell / 3)
}

export function getBoxCurColumn(topLeftCol, cell) {
  return topLeftCol + (cell % 3)
}

export function getTopLeftColumnForBoxNum(boxNum) {
  return 3 * (boxNum % 3)
}

export function swapXY(grid) {
  return allIndexes.map(c => grid.map(r => r[c]))
}

export function getBoxTopLeftCoordinates(boxNum) {
  return [getBoxTopLeft(boxNum), getTopLeftColumnForBoxNum(boxNum)]
}

export function getBoxAsFlatArray(grid, topLeftRowNum, topLeftColNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColNum, topLeftColNum + 3))
    .flat()
}

export function boxesAsRowsArray(grid) {
  return boxIndexes
    .map(r => boxIndexes.map(c => getBoxAsFlatArray(grid, r, c)))
    .flat()
}

export function unflattenBox(boxArray) {
  return boxIndexes.map(i => boxArray.slice(i, i + 3))
}

export function unflattenBoxes(grid) {
  let unflattenedGrid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE })
  )

  grid.forEach((b, bIdx) => {
    const [topLeftRow, topLeftCol] = getBoxTopLeftCoordinates(bIdx)

    unflattenBox(b).forEach((r, rIdx) => {
      r.forEach((c, cIdx) => {
        unflattenedGrid[topLeftRow + rIdx][topLeftCol + cIdx] = c
      })
    })
  })

  return unflattenedGrid
}

export function boxIsComplete(grid, topLeftRowNum, topLeftColNum) {
  return getBoxAsFlatArray(grid, topLeftRowNum, topLeftColNum).every(c =>
    isFilled(c)
  )
}

export function boxIsValid(grid, topLeftRowNum, topLeftColNum) {
  return (
    JSON.stringify(
      [
        ...getBoxFilledNums(grid, topLeftRowNum, topLeftColNum),
        ...getBoxMissingNums(grid, topLeftRowNum, topLeftColNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

export function everyBoxIsValid(grid) {
  for (let r = 0; r < GRID_SIZE; r += 3) {
    for (let c = 0; c < GRID_SIZE; c += 3) {
      if (!boxIsValid(grid, r, c)) {
        return false
      }
    }
  }
  return true
}

export function getBoxFilledNums(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .filter(c => isFilled(c))
}

export function getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum) {
  const filledNums = getBoxFilledNums(grid, topLeftRowNum, topLeftColumnNum)
  return possibleNums.filter(n => !filledNums.includes(n))
}

export function getBoxMissingCells(grid, topLeftRowNum, topLeftColumnNum) {
  return getArrayMissingCells(
    grid
      .slice(topLeftRowNum, topLeftRowNum + 3)
      .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
      .flat()
  )
}

export function checkCellAgainstOtherAxis(grid, rowNum, colNum, num, curAxis) {
  const rowMissingNums = getRowMissingNums(grid, rowNum)
  const columnMissingNums = getColumnMissingNums(grid, colNum)

  const isXAxis = curAxis === axis.x
  const curAxisMissingNums = isXAxis ? rowMissingNums : columnMissingNums
  const otherAxisMissingNums = isXAxis ? columnMissingNums : rowMissingNums
  const curAxisMissingCellsFn = isXAxis
    ? getRowMissingCells
    : getColumnMissingCells
  const otherAxisFilledNumsFn = isXAxis ? getColumnFilledNums : getRowFilledNums
  const curAxisIndex = isXAxis ? rowNum : colNum
  const otherAxisIndex = isXAxis ? colNum : rowNum

  return (
    (curAxisMissingNums.length === 1 && curAxisMissingNums[0] === num) ||
    (curAxisMissingNums.includes(num) &&
      otherAxisMissingNums.includes(num) &&
      curAxisMissingCellsFn(grid, curAxisIndex)
        .filter(cell => cell !== otherAxisIndex)
        .every(v => otherAxisFilledNumsFn(grid, v).includes(num)) &&
      getBoxMissingNums(
        grid,
        getBoxTopLeft(rowNum),
        getBoxTopLeft(colNum)
      ).includes(num))
  )
}

export function cellCanBeDeterminedForRow(grid, rowNum, colNum, num) {
  return checkCellAgainstOtherAxis(grid, rowNum, colNum, num, axis.x)
}

export function fillRows(grid) {
  grid.forEach((_, rowNum) => {
    getRowMissingNums(grid, rowNum).forEach(n => {
      getRowMissingCells(grid, rowNum).forEach(colNum => {
        if (cellCanBeDeterminedForRow(grid, rowNum, colNum, n)) {
          grid[rowNum][colNum] = n
        }
      })
    })
  })

  return grid
}

export function cellCanBeDeterminedForColumn(grid, rowNum, colNum, num) {
  return checkCellAgainstOtherAxis(grid, rowNum, colNum, num, axis.y)
}

export function fillColumns(grid) {
  grid[0].forEach((_, colNum) => {
    getColumnMissingNums(grid, colNum).forEach(n => {
      getColumnMissingCells(grid, colNum).forEach(rowNum => {
        if (cellCanBeDeterminedForColumn(grid, rowNum, colNum, n)) {
          grid[rowNum][colNum] = n
        }
      })
    })
  })

  return grid
}

function getBoxIndexes(topLeftRowOrColumn) {
  return [topLeftRowOrColumn, topLeftRowOrColumn + 1, topLeftRowOrColumn + 2]
}

export function cellCanBeDeterminedForBox(
  grid,
  cell,
  topLeftRow,
  topLeftColumn,
  num
) {
  const curRow = getBoxCurRow(topLeftRow, cell)
  const curColumn = getBoxCurColumn(topLeftColumn, cell)

  const rowNeighborsAreFilled = grid[curRow]
    .map((cell, index) => ({ cell, index }))
    .slice(topLeftColumn, topLeftColumn + 3)
    .filter(({ index }) => index !== curColumn)
    .every(({ cell }) => isFilled(cell))

  const rowNeighborsContainNum = getBoxIndexes(topLeftRow)
    .filter(r => r !== curRow)
    .every(r => getRowFilledNums(grid, r).includes(num))

  const columnNeighborsAreFilled = grid
    .map(r => r[curColumn])
    .map((cell, index) => ({ cell, index }))
    .slice(topLeftRow, topLeftRow + 3)
    .filter(({ index }) => index !== curRow)
    .every(({ cell }) => isFilled(cell))

  const columnNeighborsContainNum = getBoxIndexes(topLeftColumn)
    .filter(c => c !== curColumn)
    .every(c => getColumnFilledNums(grid, c).includes(num))

  const boxMissingNums = getBoxMissingNums(grid, topLeftRow, topLeftColumn)

  return (
    // this is the only missing number - we're done.
    (boxMissingNums.length === 1 && boxMissingNums[0] === num) ||
    // bail if number is already in the box, row, or column
    (boxMissingNums.includes(num) &&
      getRowMissingNums(grid, curRow).includes(num) &&
      getColumnMissingNums(grid, curColumn).includes(num) &&
      // Both other column cells in box are determined and both other complete columns have the number
      ((columnNeighborsAreFilled && columnNeighborsContainNum) ||
        // Both other row cells in box are determined and both other complete rows have the number
        (rowNeighborsAreFilled && rowNeighborsContainNum) ||
        // Both other complete rows and both other complete columns have the number
        (rowNeighborsContainNum && columnNeighborsContainNum)))
  )
}

export function fillBoxes(grid) {
  for (let topLeftRow = 0; topLeftRow < grid.length; topLeftRow += 3) {
    for (let topLeftCol = 0; topLeftCol < grid[0].length; topLeftCol += 3) {
      getBoxMissingNums(grid, topLeftRow, topLeftCol).forEach(n => {
        getBoxMissingCells(grid, topLeftRow, topLeftCol).forEach(cell => {
          const curRow = getBoxCurRow(topLeftRow, cell)
          const curColumn = getBoxCurColumn(topLeftCol, cell)

          if (cellCanBeDeterminedForBox(grid, cell, topLeftRow, topLeftCol, n))
            grid[curRow][curColumn] = n
        })
      })
    }
  }

  return grid
}

export function getFilledCellCount(grid) {
  return grid.map(r => r.filter(c => isFilled(c))).flat().length
}

export function gridIsValid(grid) {
  return (
    everyRowIsValid(grid) && everyColumnIsValid(grid) && everyBoxIsValid(grid)
  )
}

/* istanbul ignore next */
function log(grid, loopCount, msg) {
  if (DEBUG) {
    console.log(`Pass ${loopCount} ${msg}`)
    console.log(`${stringifyGrid(grid)}\n\n`)
  }
}

export function allArraysAreEqual(...arrayOfArrays) {
  const firstArr = arrayOfArrays[0]

  return arrayOfArrays
    .slice(1)
    .every(
      a =>
        a.length === firstArr.length &&
        a.every((element, idx) => element === firstArr[idx])
    )
}

export function getUniqueArrays(...arrayOfArrays) {
  let uniqueArrays = [arrayOfArrays[0]]

  arrayOfArrays.slice(1).forEach(a => {
    if (uniqueArrays.every(u => !allArraysAreEqual(u, a))) {
      uniqueArrays.push(a)
    }
  })

  return uniqueArrays
}

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

function narrowPossibles(matches, possiblesGrid) {
  let possibleValsGrid = cloneDeep(possiblesGrid)

  for (let n = 2; n < GRID_SIZE; n++) {
    matches.forEach((m, rowIdx) => {
      const matchesOfSizeN = m.filter(
        r => r.matches.length > 0 && r.possibles.length === n
      )

      if (matchesOfSizeN.length === n) {
        const matchingSets = getUniqueArrays(
          ...matchesOfSizeN.map(m => m.possibles)
        )

        matchingSets.forEach(possibles => {
          const setIndexes = [
            ...new Set(matchesOfSizeN.map(m => m.matches).flat())
          ]

          allIndexes
            .filter(n => !setIndexes.includes(n))
            .forEach(colIdx => {
              possibleValsGrid[rowIdx][colIdx] = possibleValsGrid[rowIdx][
                colIdx
              ].filter((v, _, a) => n > a.length || !possibles.includes(v))
            })
        })
      }
    })
  }

  return possibleValsGrid
}

export function processRowMatchingSets(possibleValsGrid) {
  return narrowPossibles(possibleValsGrid.map(findMatches), possibleValsGrid)
}

export function processColumnMatchingSets(possibleValsGrid) {
  const columnMatches = possibleValsGrid[0]
    .map((_, cIdx) => possibleValsGrid.map(r => r[cIdx]))
    .map(findMatches)

  return swapXY(
    narrowPossibles(swapXY(columnMatches), swapXY(possibleValsGrid))
  )
}

export function processBoxMatchingSets(possibleValsGrid) {
  const possibleValsBoxesAsRows = boxesAsRowsArray(possibleValsGrid)
  const boxMatches = possibleValsBoxesAsRows.map(findMatches)

  return unflattenBoxes(narrowPossibles(boxMatches, possibleValsBoxesAsRows))
}

export function processMatchingSets(possibleValsGrid) {
  return processRowMatchingSets(
    processColumnMatchingSets(processBoxMatchingSets(possibleValsGrid))
  )
}

export function gridPossibleValues(grid) {
  let possibleValsGrid = grid.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (isFilled(c)) return [c]

      const rowMissingNums = getRowMissingNums(grid, rIdx)
      const colMissingNums = getColumnMissingNums(grid, cIdx)
      const boxMissingNums = getBoxMissingNums(
        grid,
        getBoxTopLeft(rIdx),
        getBoxTopLeft(cIdx)
      )

      return [...new Set(rowMissingNums)]
        .filter(a => new Set(colMissingNums).has(a))
        .filter(b => new Set(boxMissingNums).has(b))
    })
  )

  // stealing some strategies from
  // https://medium.com/@eneko/solving-sudoku-puzzles-programmatically-with-logic-and-without-brute-force-b4e8b837d796
  return processMatchingSets(possibleValsGrid)
}

export function getPossibleCellValues(grid, rowNum, colNum) {
  // TODO: look into how to use gridPossibleVals efficiently here

  const rowMissingNums = getRowMissingNums(grid, rowNum)
  const colMissingNums = getColumnMissingNums(grid, colNum)
  const boxMissingNums = getBoxMissingNums(
    grid,
    getBoxTopLeft(rowNum),
    getBoxTopLeft(colNum)
  )

  return [...new Set(rowMissingNums)]
    .filter(a => new Set(colMissingNums).has(a))
    .filter(b => new Set(boxMissingNums).has(b))
}

export function getNextEmptyCellCoordinates(grid, rowNum, colNum) {
  let newRowNum = rowNum
  let newColNum = colNum
  const lastIndex = GRID_SIZE - 1

  if (rowNum === lastIndex && colNum === lastIndex) return undefined

  if (colNum === lastIndex) {
    newRowNum += 1
    newColNum = 0
  } else {
    newColNum += 1
  }

  if (!isFilled(grid[newRowNum][newColNum])) return [newRowNum, newColNum]

  return getNextEmptyCellCoordinates(grid, newRowNum, newColNum)
}

export function gridHasAnyImpossibilities(grid) {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (
        !isFilled(grid[i][j]) &&
        getPossibleCellValues(grid, i, j).length === 0
      ) {
        return true
      }
    }
  }
  return false
}

export function fillAutomaticCells(grid) {
  let updatedGrid = cloneDeep(grid)
  let prevFilledCellCount = 0
  let filledCellCount = getFilledCellCount(updatedGrid)
  let loopCount = 0

  while (
    filledCellCount > prevFilledCellCount &&
    filledCellCount < GRID_SIZE ** 2
  ) {
    loopCount++
    prevFilledCellCount = filledCellCount

    updatedGrid = fillBoxes(updatedGrid)
    log(updatedGrid, loopCount, '- Boxes')
    updatedGrid = fillRows(updatedGrid)
    log(updatedGrid, loopCount, '- Rows')
    updatedGrid = fillColumns(updatedGrid)
    log(updatedGrid, loopCount, '- Columns')

    gridPossibleValues(updatedGrid).forEach((r, rIdx) =>
      r.forEach((c, cIdx) => {
        if (!isFilled(updatedGrid[rIdx][cIdx])) {
          if (c.length === 1) updatedGrid[rIdx][cIdx] = c[0]
        }
      })
    )

    /* istanbul ignore next */
    if (!gridIsValid(updatedGrid)) {
      printGrid(updatedGrid)
      throw 'uh-oh'
    }

    filledCellCount = getFilledCellCount(updatedGrid)
  }

  return updatedGrid
}

export function fillInAllCellsRecursive(grid) {
  if (getFilledCellCount(grid) === GRID_SIZE ** 2) return grid
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
          if (gridHasAnyImpossibilities(curGrid)) {
            return
          }

          const cellPossibles = getPossibleCellValues(curGrid, rowNum, colNum)

          cellPossibles.forEach(possibleNum => {
            curGrid[rowNum][colNum] = possibleNum

            const nextCoordinates = getNextEmptyCellCoordinates(
              grid,
              rowNum,
              colNum
            )

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
  console.log({ count })
  return finalGrid
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

  let strGrid = horSeparator.repeat(
    (GRID_SIZE - 1) * innerSeparator.length + GRID_SIZE + pad
  )

  for (let row = 0; row < GRID_SIZE; row++) {
    let logStr = grid[row]
      .map(c => (isFilled(c) ? c : ' '))
      .join(innerSeparator)

    logStr = replaceCharAt(logStr, 15, boxSeparatorVert)
    logStr = replaceCharAt(logStr, 33, boxSeparatorVert)

    strGrid += `\n${rowBegin}${logStr}${rowEnd}\n`
    strGrid += ([2, 5].includes(row) ? boxSeparatorHor : horSeparator).repeat(
      logStr.length + pad
    )
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
  console.log('Starting Grid')
  printGrid(startingGrid)

  const automaticCellsFilledGrid = fillAutomaticCells(startingGrid)
  console.log('After automatic cells filled:')
  printGrid(automaticCellsFilledGrid)

  const finalGrid = fillInAllCellsRecursive(automaticCellsFilledGrid)
  console.log('\nAfter filling in the rest')
  printGrid(finalGrid)

  console.log('Stats:')
  console.log('Starting boxes:', getFilledCellCount(startingGrid))
  console.log(
    'After automatic cells filled:',
    getFilledCellCount(automaticCellsFilledGrid)
  )
  // console.log('After rest:', getFilledCellCount(finalGrid))
  console.log('Time:', Date.now() - t1)
}
