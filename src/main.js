import fs from 'fs'

const GRID_SIZE = 9
const EMPTY_CELL = '.'

export const startingGrid = fs
  .readFileSync('./input.txt', 'utf8')
  .split(/\r?\n/)
  .filter(d => d)
  .map(d => [...d].map(c => ({ value: c, locked: c !== EMPTY_CELL })))

export const possibleNums = '123456789'.split('')

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

function getBoxTopLeft(rowOrCol) {
  return rowOrCol - (rowOrCol % 3)
}

function getBoxCurRow(topLeftRow, cell) {
  return topLeftRow + Math.floor(cell / 3)
}

function getBoxCurColumn(topLeftCol, cell) {
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

// TODO: can the cellCanBeDetermined functions be combined?
export function cellCanBeDeterminedForRow(grid, rowNum, colNum, num) {
  const rowMissingNums = getRowMissingNums(grid, rowNum)
  return (
    (rowMissingNums.length === 1 && rowMissingNums[0] === num) ||
    (rowMissingNums.includes(num) &&
      getColumnMissingNums(grid, colNum).includes(num) &&
      getRowMissingCells(grid, rowNum)
        .filter(cell => cell !== colNum)
        .every(c => getColumnLockedNums(grid, c).includes(num)) &&
      getBoxMissingNums(
        grid,
        getBoxTopLeft(rowNum),
        getBoxTopLeft(colNum)
      ).includes(num))
  )
}

function fillRows(grid) {
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

function cellCanBeDeterminedForColumn(grid, rowNum, colNum, num) {
  const columnMissingNums = getColumnMissingNums(grid, colNum)
  return (
    (columnMissingNums.length === 1 && columnMissingNums[0] === num) ||
    (columnMissingNums.includes(num) &&
      getRowMissingNums(grid, rowNum).includes(num) &&
      getColumnMissingCells(grid, colNum)
        .filter(cell => cell !== rowNum)
        .every(r => getRowLockedNums(grid, r).includes(num)) &&
      getBoxMissingNums(
        grid,
        getBoxTopLeft(rowNum),
        getBoxTopLeft(colNum)
      ).includes(num))
  )
}

function fillColumns(grid) {
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

function fillBoxes(grid) {
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

export function getKnownCells(grid) {
  let knownCells = []

  grid.forEach((r, rowNum) => {
    r.forEach((_, colNum) => {
      if (grid[rowNum][colNum].locked)
        knownCells.push(rowNum * grid.length + colNum + 1)
    })
  })

  return knownCells
}

function gridIsValid(grid) {
  return (
    everyRowIsValid(grid) && everyColumnIsValid(grid) && everyBoxIsValid(grid)
  )
}

function lowHangingFruit(grid) {
  let newGrid = grid
  // let prevLockedCellCount = 0
  // let lockedCellCount = getKnownCells(newGrid).length

  while (getKnownCells(newGrid).length < GRID_SIZE ** 2) {
    // for each missing number, cycle through all the columns where row is missing a cell
    // if all other columns contain the number, then can fill in the cell.
    // Do the same for boxes. Keep looping through until you go through every row without filling in a cell.
    // Then do same thing for columns, then boxes.z
    // prevLockedCellCount = lockedCellCount
    newGrid = fillBoxes(newGrid)
    newGrid = fillRows(newGrid)
    newGrid = fillColumns(newGrid)

    if (!gridIsValid(newGrid)) {
      printGrid(newGrid)
      throw 'uh-oh'
    }

    // lockedCellCount = getKnownCells(newGrid.length)
  }

  return newGrid
}

export function printGrid(grid) {
  // console.table(grid.map(r => r.map(c => c.value)))
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

  console.log(
    horSeparator.repeat(
      (GRID_SIZE - 1) * innerSeparator.length + GRID_SIZE + pad
    )
  )
  for (let row = 0; row < GRID_SIZE; row++) {
    let logStr = grid[row]
      .map(({ value }) => (value === EMPTY_CELL ? ' ' : value))
      .join(innerSeparator)

    logStr = replaceCharAt(logStr, 15, boxSeparatorVert)
    logStr = replaceCharAt(logStr, 33, boxSeparatorVert)

    console.log(`${rowBegin}${logStr}${rowEnd}`)
    console.log(
      ([2, 5].includes(row) ? boxSeparatorHor : horSeparator).repeat(
        logStr.length + pad
      )
    )
  }
}

export function run() {
  console.log('starting boxes:', getKnownCells(startingGrid).length)

  const processedGrid = lowHangingFruit([...startingGrid])
  printGrid(processedGrid)

  console.log('after first pass:', getKnownCells(processedGrid).length)
}
