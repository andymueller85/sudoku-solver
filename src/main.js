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
    .filter(d => d)
    .map(d => [...d].map(c => ({ value: c, locked: c !== EMPTY_CELL })))
}

export const possibleNums = '123456789'.split('')
export const axis = { x: 'X', y: 'Y' }

export function rowIsComplete(grid, rowNum) {
  return grid[rowNum].every(c => c.locked)
}

export function rowIsValid(grid, rowNum) {
  return (
    JSON.stringify(
      [
        ...getRowLockedNums(grid, rowNum),
        ...getRowMissingNums(grid, rowNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

export function everyRowIsValid(grid) {
  return grid.every((_, rowNum) => rowIsValid(grid, rowNum))
}

export function getRowLockedNums(grid, rowNum) {
  return grid[rowNum].filter(c => c.locked).map(c => c.value)
}

export function getRowMissingNums(grid, rowNum) {
  const lockedNums = getRowLockedNums(grid, rowNum)
  return possibleNums.filter(n => !lockedNums.includes(n))
}

export function getRowMissingCells(grid, rowNum) {
  return grid[rowNum]
    .map((cell, index) => ({ ...cell, index }))
    .filter(({ value }) => value === EMPTY_CELL)
    .map(({ index }) => index)
}

export function columnIsComplete(grid, columnNum) {
  return grid.map(r => r[columnNum]).every(c => c.locked)
}

export function columnIsValid(grid, colNum) {
  return (
    JSON.stringify(
      [
        ...getColumnLockedNums(grid, colNum),
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

export function getColumnLockedNums(grid, columnNum) {
  return grid
    .map(r => r[columnNum])
    .filter(c => c.locked)
    .map(({ value }) => value)
}

export function getColumnMissingNums(grid, columnNum) {
  const lockedNums = getColumnLockedNums(grid, columnNum)
  return possibleNums.filter(n => !lockedNums.includes(n))
}

export function getColumnMissingCells(grid, columnNum) {
  return grid
    .map(r => r[columnNum])
    .map((cell, index) => ({ ...cell, index }))
    .filter(({ value }) => value === EMPTY_CELL)
    .map(({ index }) => index)
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

export function boxIsComplete(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .every(({ locked }) => locked)
}

export function boxIsValid(grid, topLeftRowNum, topLeftColumnNum) {
  return (
    JSON.stringify(
      [
        ...getBoxLockedNums(grid, topLeftRowNum, topLeftColumnNum),
        ...getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum)
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

export function getBoxLockedNums(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .filter(({ locked }) => locked)
    .map(({ value }) => value)
}

export function getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum) {
  const lockedNums = getBoxLockedNums(grid, topLeftRowNum, topLeftColumnNum)
  return possibleNums.filter(n => !lockedNums.includes(n))
}

export function getBoxMissingCells(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .map((cell, index) => ({ ...cell, index }))
    .filter(({ value }) => value === EMPTY_CELL)
    .map(({ index }) => index)
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
  const otherAxisLockedNumsFn = isXAxis ? getColumnLockedNums : getRowLockedNums
  const curAxisIndex = isXAxis ? rowNum : colNum
  const otherAxisIndex = isXAxis ? colNum : rowNum

  return (
    (curAxisMissingNums.length === 1 && curAxisMissingNums[0] === num) ||
    (curAxisMissingNums.includes(num) &&
      otherAxisMissingNums.includes(num) &&
      curAxisMissingCellsFn(grid, curAxisIndex)
        .filter(cell => cell !== otherAxisIndex)
        .every(v => otherAxisLockedNumsFn(grid, v).includes(num)) &&
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
          grid[rowNum][colNum] = { value: n, locked: true }
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
          grid[rowNum][colNum] = { value: n, locked: true }
        }
      })
    })
  })

  return grid
}

function getBoxIndexes(topLeftRowOrColumn) {
  return [topLeftRowOrColumn, topLeftRowOrColumn + 1, topLeftRowOrColumn + 2]
}

function cellCanBeDeterminedForBox(grid, cell, topLeftRow, topLeftColumn, num) {
  const curRow = getBoxCurRow(topLeftRow, cell)
  const curColumn = getBoxCurColumn(topLeftColumn, cell)

  const rowNeighborsAreLocked = grid[curRow]
    .map((c, i) => ({ ...c, i }))
    .slice(topLeftColumn, topLeftColumn + 3)
    .filter(c => c.i !== curColumn)
    .every(c => c.locked)

  const rowNeighborsContainNum = getBoxIndexes(topLeftRow)
    .filter(r => r !== curRow)
    .every(r => getRowLockedNums(grid, r).includes(num))

  const columnNeighborsAreLocked = grid
    .map(r => r[curColumn])
    .map((c, i) => ({ ...c, i }))
    .slice(topLeftRow, topLeftRow + 3)
    .filter(c => c.i !== curRow)
    .every(c => c.locked)

  const columnNeighborsContainNum = getBoxIndexes(topLeftColumn)
    .filter(c => c !== curColumn)
    .every(c => getColumnLockedNums(grid, c).includes(num))

  const boxMissingNums = getBoxMissingNums(grid, topLeftRow, topLeftColumn)

  return (
    // this is the only missing number - we're done.
    (boxMissingNums.length === 1 && boxMissingNums[0] === num) ||
    // bail if number is already in the box, row, or column
    (boxMissingNums.includes(num) &&
      getRowMissingNums(grid, curRow).includes(num) &&
      getColumnMissingNums(grid, curColumn).includes(num) &&
      // Both other column cells in box are determined and both other complete columns have the number
      ((columnNeighborsAreLocked && columnNeighborsContainNum) ||
        // Both other row cells in box are determined and both other complete rows have the number
        (rowNeighborsAreLocked && rowNeighborsContainNum) ||
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
            grid[curRow][curColumn] = { value: n, locked: true }
        })
      })
    }
  }

  return grid
}

export function getKnownCellCount(grid) {
  return grid.map(r => r.filter(c => c.locked)).flat().length
}

export function gridIsValid(grid) {
  return (
    everyRowIsValid(grid) && everyColumnIsValid(grid) && everyBoxIsValid(grid)
  )
}

function log(grid, loopCount, msg) {
  if (DEBUG) {
    console.log(`Pass ${loopCount} ${msg}`)
    console.log(`${stringifyGrid(grid)}\n\n`)
  }
}

export function lowHangingFruit(grid) {
  let updatedGrid = cloneDeep(grid)
  let prevLockedCellCount = 0
  let lockedCellCount = getKnownCellCount(updatedGrid)
  let loopCount = 0

  while (
    lockedCellCount > prevLockedCellCount &&
    lockedCellCount < GRID_SIZE ** 2
  ) {
    loopCount++
    prevLockedCellCount = lockedCellCount

    updatedGrid = fillBoxes(updatedGrid)
    log(updatedGrid, loopCount, '- Boxes')
    updatedGrid = fillRows(updatedGrid)
    log(updatedGrid, loopCount, '- Rows')
    updatedGrid = fillColumns(updatedGrid)
    log(updatedGrid, loopCount, '- Columns')

    if (!gridIsValid(updatedGrid)) {
      printGrid(updatedGrid)
      throw 'uh-oh'
    }

    lockedCellCount = getKnownCellCount(updatedGrid)
  }

  return updatedGrid
}

export function getPossibleCellValues(grid, rowNum, colNum) {
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

export function getNextCellCoordinates(grid, rowNum, colNum) {
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

  return [newRowNum, newColNum]
}

export function fillInTheRest(grid) {
  if (getKnownCellCount(grid) === GRID_SIZE ** 2) return grid
  let finalGrid = undefined

  function recurse(myGrid, curRow = 0, curCol = 0) {
    const curGrid = cloneDeep(myGrid)

    for (let rowNum = curRow; rowNum < GRID_SIZE; rowNum++) {
      let colNum = rowNum === curRow ? curCol : 0
      for (; colNum < GRID_SIZE; colNum++) {
        if (curGrid[rowNum][colNum].value === EMPTY_CELL) {
          const cellPossibles = getPossibleCellValues(curGrid, rowNum, colNum)

          if (cellPossibles.length === 0) {
            return
          }

          cellPossibles.forEach(possibleNum => {
            curGrid[rowNum][colNum] = { value: possibleNum, locked: true }

            const nextCoordinates = getNextCellCoordinates(
              curGrid,
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
      .map(({ value }) => (value === EMPTY_CELL ? ' ' : value))
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

export function run() {
  const t1 = Date.now()
  const startingGrid = seedGrid(fileInput)
  const lowFruitGrid = lowHangingFruit(startingGrid)
  const finalGrid = fillInTheRest(lowFruitGrid)

  console.log('After low hanging fruit:')
  console.log(stringifyGrid(lowFruitGrid))
  console.log('\nAfter filling in the rest')
  console.log(stringifyGrid(finalGrid))
  console.log('Starting boxes:', getKnownCellCount(startingGrid))
  console.log('After low hanging fruit:', getKnownCellCount(lowFruitGrid))
  console.log('After rest:', getKnownCellCount(finalGrid))
  console.log('Time:', Date.now() - t1)
}
