import fs from 'fs'

const GRID_SIZE = 9
const EMPTY_CELL = '.'

const startingGrid = fs
  .readFileSync('./input.txt', 'utf8')
  .split(/\r?\n/)
  .filter(d => d)
  .map(d => [...d].map(c => ({ value: c, locked: c !== EMPTY_CELL })))
  
const possibleNums = '123456789'.split('')

export function rowIsComplete(grid, rowNum) {
  return grid[rowNum].every(c => c.locked)
}

function rowIsValid(grid, rowNum) {
  return (
    JSON.stringify(
      [
        ...getRowLockedNums(grid, rowNum),
        ...getRowMissingNums(grid, rowNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

function everyRowIsValid(grid) {
  return grid.every((_, i) => rowIsValid(grid, i))
}

function getRowLockedNums(grid, rowNum) {
  return grid[rowNum].filter(({ locked }) => locked).map(({ value }) => value)
}

function getRowMissingNums(grid, rowNum) {
  return possibleNums.filter(n => !getRowLockedNums(grid, rowNum).includes(n))
}

function getRowMissingCells(grid, rowNum) {
  return grid[rowNum]
    .map((cell, index) => ({ ...cell, index }))
    .filter(({ value }) => value === EMPTY_CELL)
    .map(({ index }) => index)
}

function columnIsComplete(grid, columnNum) {
  return grid.map(r => r[columnNum]).every(c => c.locked)
}

function columnIsValid(grid, colNum) {
  return (
    JSON.stringify(
      [
        ...getColumnLockedNums(grid, colNum),
        ...getColumnMissingNums(grid, colNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

function everyColumnIsValid(grid) {
  for (let col = 0; col < GRID_SIZE; col++) {
    if (!columnIsValid(grid, col)) return false
  }
  return true
}

function getColumnLockedNums(grid, columnNum) {
  return grid
    .map(r => r[columnNum])
    .filter(c => c.locked)
    .map(({ value }) => value)
}

function getColumnMissingNums(grid, columnNum) {
  return possibleNums.filter(
    n => !getColumnLockedNums(grid, columnNum).includes(n)
  )
}

function getColumnMissingCells(grid, columnNum) {
  return grid
    .map(r => r[columnNum])
    .map((cell, index) => ({ ...cell, index }))
    .filter(({ value }) => value === EMPTY_CELL)
    .map(({ index }) => index)
}

function getKnownCells(grid) {
  let knownCells = []
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j].locked) knownCells.push(i * grid.length + j + 1)
    }
  }
  return knownCells
}

function boxIsComplete(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .every(({ locked }) => locked)
}

function boxIsValid(grid, topLeftRowNum, topLeftColumnNum) {
  return (
    JSON.stringify(
      [
        ...getBoxLockedNums(grid, topLeftRowNum, topLeftColumnNum),
        ...getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum)
      ].sort()
    ) === JSON.stringify(possibleNums)
  )
}

function everyBoxIsValid(grid) {
  for (let r = 0; r < GRID_SIZE; r += 3) {
    for (let c = 0; c < GRID_SIZE; c += 3) {
      if (!boxIsValid(grid, r, c)) {
        return false
      }
    }
  }
  return true
}

function gridIsValid(grid) {
  return (
    everyRowIsValid(grid) && everyColumnIsValid(grid) && everyBoxIsValid(grid)
  )
}

function getBoxLockedNums(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .filter(({ locked }) => locked)
    .map(({ value }) => value)
}

function getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum) {
  return possibleNums.filter(
    n => !getBoxLockedNums(grid, topLeftRowNum, topLeftColumnNum).includes(n)
  )
}

function getBoxMissingCells(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .map((cell, index) => ({ ...cell, index }))
    .filter(({ value }) => value === EMPTY_CELL)
    .map(({ index }) => index)
}

function cellCanBeDeterminedForRow(grid, rowNum, colNum, num, rowEmptyCells) {
  const rowMissingNums = getRowMissingNums(grid, rowNum)
  return (
    (rowMissingNums.length === 1 && rowMissingNums[0] === num) ||
    (!getColumnLockedNums(grid, colNum).includes(num) &&
      rowEmptyCells
        .filter(cell => cell !== colNum)
        .every(c => getColumnLockedNums(grid, c).includes(num)) &&
      !getBoxLockedNums(
        grid,
        rowNum - (rowNum % 3),
        colNum - (colNum % 3)
      ).includes(num))
  )
}

function fillRows(grid) {
  for (let row = 0; row < grid.length; row++) {
    getRowMissingNums(grid, row).forEach(n => {
      getRowMissingCells(grid, row).forEach((col, _, missingCellsArray) => {
        if (cellCanBeDeterminedForRow(grid, row, col, n, missingCellsArray)) {
          grid[row][col] = { value: n, locked: true }
        }
      })
    })
  }

  return grid
}

function cellCanBeDeterminedForColumn(
  grid,
  rowNum,
  colNum,
  num,
  columnEmptyCells
) {
  const columnMissingNums = getColumnMissingNums(grid, colNum)
  return (
    (columnMissingNums.length === 1 && columnMissingNums[0] === num) ||
    (!getRowLockedNums(grid, rowNum).includes(num) &&
      columnEmptyCells
        .filter(cell => cell !== rowNum)
        .every(r => getRowLockedNums(grid, r).includes(num)) &&
      !getBoxLockedNums(
        grid,
        rowNum - (rowNum % 3),
        colNum - (colNum % 3)
      ).includes(num))
  )
}

function fillColumns(grid) {
  for (let col = 0; col < grid[0].length; col++) {
    getColumnMissingNums(grid, col).forEach(n => {
      getColumnMissingCells(grid, col).forEach((row, _, missingCellsArray) => {
        if (
          cellCanBeDeterminedForColumn(grid, row, col, n, missingCellsArray)
        ) {
          grid[row][col] = { value: n, locked: true }
        }
      })
    })
  }

  return grid
}

function cellCanBeDeterminedForBox(grid, cell, topLeftRow, topLeftColumn, num) {
  const relevantRowNums = [topLeftRow, topLeftRow + 1, topLeftRow + 2]
  const relevantColumnNums = [
    topLeftColumn,
    topLeftColumn + 1,
    topLeftColumn + 2
  ]

  const curRow = topLeftRow + Math.floor(cell / 3)
  const curColumn = topLeftColumn + (cell % 3)

  const rowNeighborsAreLocked = grid[curRow]
    .map((c, i) => ({ ...c, i }))
    .slice(topLeftColumn, topLeftColumn + 3)
    .filter(c => c.i !== curColumn)
    .every(c => c.locked)

  const rowNeighborsContainNum = relevantRowNums
    .filter(r => r !== curRow)
    .every(r => getRowLockedNums(grid, r).includes(num))

  const columnNeighborsAreLocked = grid
    .map(r => r[curColumn])
    .map((c, i) => ({ ...c, i }))
    .slice(topLeftRow, topLeftRow + 3)
    .filter(c => c.i !== curRow)
    .every(c => c.locked)

  const columnNeighborsContainNum = relevantColumnNums
    .filter(c => c !== curColumn)
    .every(c => getColumnLockedNums(grid, c).includes(num))

  const boxMissingNums = getBoxMissingNums(grid, topLeftRow, topLeftColumn)

  return (
    // this is the only missing number - we're done.
    (boxMissingNums.length === 1 && boxMissingNums[0] === num) ||
    // bail if the number is already in the row or column
    (!getRowLockedNums(grid, curRow).includes(num) &&
      !getColumnLockedNums(grid, curColumn).includes(num) &&
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
        getBoxMissingCells(grid, topLeftRow, topLeftCol).forEach(
          (cell, _, missingCellsArray) => {
            if (
              cellCanBeDeterminedForBox(grid, cell, topLeftRow, topLeftCol, n)
            ) {
              grid[Math.floor(topLeftRow + cell / 3)][
                topLeftCol + (cell % 3)
              ] = { value: n, locked: true }
            }
          }
        )
      })
    }
  }

  return grid
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

function printGrid(grid) {
  // console.table(grid.map(r => r.map(c => c.value)))
  const vertSeparator = '|'
  const innerSeparator = `  ${vertSeparator}  `
  const rowBegin = `${vertSeparator}  `
  const rowEnd = `  ${vertSeparator}`
  const pad = rowBegin.length + rowEnd.length
  const horSeparator = '-'
  const boxSeparatorVert = String.fromCharCode(parseInt('275A', 16))
  const boxSeparatorHor = '='

  function replaceCharAt(str, i, c) {
    return str.substring(0, i) + c + str.substring(i + 1)
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

export function run(){
  console.log('starting boxes:', getKnownCells(startingGrid).length)

  const processedGrid = lowHangingFruit(startingGrid)
  printGrid(processedGrid)
  
  console.log('after first pass:', getKnownCells(processedGrid).length)
}


