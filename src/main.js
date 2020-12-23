const GRID_SIZE = 9
const EMPTY_CELL = '.'

const startingGrid = require('fs')
  .readFileSync('./input.txt', 'utf8')
  .split(/\r?\n/)
  .filter(d => d)
  .map(d => [...d].map(c => ({ value: c, locked: c !== EMPTY_CELL })))

const possibleNums = '123456789'.split('')

function rowIsGood(grid, rowNum) {
  return grid[rowNum].every(c => c.locked)
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

function columnIsGood(grid, columnNum) {
  return grid.map(r => r[columnNum]).every(c => c.locked)
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

function boxIsGood(grid, topLeftRowNum, topLeftColumnNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .every(({ locked }) => locked)
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

function cellCanBeDeterminedForRow(grid, col, num, rowEmptyCells) {
  return (
    rowEmptyCells.length === 1 ||
    (!getColumnLockedNums(grid, col).includes(num) &&
      rowEmptyCells
        .filter(cell => cell !== col)
        .every(c => getColumnLockedNums(grid, c).includes(num)))
  )
}

function fillRows(grid) {
  for (let row = 0; row < grid.length; row++) {
    getRowMissingNums(grid, row).forEach(n => {
      getRowMissingCells(grid, row).forEach((col, _, missingCellsArray) => {
        if (cellCanBeDeterminedForRow(grid, col, n, missingCellsArray)) {
          grid[row][col] = { value: n, locked: true }
        }
      })
    })
  }

  return grid
}

function cellCanBeDeterminedForColumn(grid, row, num, columnEmptyCells) {
  return (
    columnEmptyCells.length === 1 ||
    (!getRowLockedNums(grid, row).includes(num) &&
      columnEmptyCells
        .filter(cell => cell !== row)
        .every(r => getRowLockedNums(grid, r).includes(num)))
  )
}

function fillColumns(grid) {
  for (let col = 0; col < grid[0].length; col++) {
    getColumnMissingNums(grid, col).forEach(n => {
      getColumnMissingCells(grid, col).forEach((row, _, missingCellsArray) => {
        if (cellCanBeDeterminedForColumn(grid, row, n, missingCellsArray)) {
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

  return (
    getBoxMissingCells(grid, topLeftRow, topLeftColumn).length === 1 ||
    (!getRowLockedNums(grid, curRow).includes(num) &&
      !getColumnLockedNums(grid, curColumn).includesNum &&
      relevantRowNums
        .filter(r => r !== curRow)
        .every(r => getRowLockedNums(grid, r).includes(num)) &&
      relevantColumnNums
        .filter(c => c !== curColumn)
        .every(c => getColumnLockedNums(grid, c).includes(num)))
  )
}

function fillBoxes(grid) {
  for (let row = 0; row < grid.length; row += 3) {
    for (let col = 0; col < grid[0].length; col += 3) {
      getBoxMissingNums(grid, row, col).forEach(n => {
        getBoxMissingCells(grid, row, col).forEach(
          (cell, _, missingCellsArray) => {
            if (cellCanBeDeterminedForBox(grid, cell, row, col, n)) {
              grid[row][col] = { value: n, locked: true }
            }
          }
        )
      })
    }
  }

  for (let col = 0; col < grid[0].length; col++) {
    getColumnMissingNums(grid, col).forEach(n => {
      getColumnMissingCells(grid, col).forEach((row, _, missingCellsArray) => {
        if (cellCanBeDeterminedForColumn(grid, row, n, missingCellsArray)) {
          grid[row][col] = { value: n, locked: true }
        }
      })
    })
  }

  return grid
}

function lowHangingFruit(grid) {
  let newGrid = grid
  let prevLockedCellCount = 0
  let lockedCellCount = getKnownCells(newGrid).length

  while (
    lockedCellCount > prevLockedCellCount &&
    getKnownCells(newGrid).length < GRID_SIZE ** 2
  ) {
    // for each missing number, cycle through all the columns where row is missing a cell
    // if all other columns contain the number, then can fill in the cell.
    // Do the same for boxes. Keep looping through until you go through every row without filling in a cell.
    // Then do same thing for columns, then boxes.z
    prevLockedCellCount = lockedCellCount
    newGrid = fillRows(newGrid)
    newGrid = fillColumns(newGrid)
    newGrid = fillBoxes(newGrid)

    lockedCellCount = getKnownCells(newGrid.length)
  }

  return grid
}

function printGrid(grid) {
  const separator = '  |  '
  const rowBegin = '|  '
  const rowEnd = '  |'
  const pad = rowBegin.length + rowEnd.length

  console.log('-'.repeat((GRID_SIZE - 1) * separator.length + GRID_SIZE + pad))
  for (let row = 0; row < GRID_SIZE; row++) {
    const logStr = grid[row]
      .map(({ value }) => (value === EMPTY_CELL ? ' ' : value))
      .join(separator)
    console.log(`${rowBegin}${logStr}${rowEnd}`)
    console.log('-'.repeat(logStr.length + pad))
  }
}

console.log('starting boxes:', getKnownCells(startingGrid).length)

const newGrid = lowHangingFruit(startingGrid)

printGrid(newGrid)

console.log('after first pass:', getKnownCells(newGrid).length)

