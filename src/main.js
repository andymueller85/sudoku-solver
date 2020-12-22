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

function getRowMissingNums(grid, rowNum) {
  return possibleNums.filter(n => !grid[rowNum].map(c => c.value).includes(n))
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
    .filter(({ locked }) => locked)
    .map(({ value }) => value)
}

function getColumnMissingNums(grid, columnNum) {
  const lockedNums = getColumnLockedNums(grid, columnNum)

  return possibleNums.filter(n => !lockedNums.includes(n))
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

function getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum) {
  return possibleNums.filter(
    n =>
      !grid
        .slice(topLeftRowNum, topLeftRowNum + 3)
        .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
        .flat()
        .map(({ value }) => value)
        .includes(n)
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

function lowHangingFruit(grid) {
  let lockedSomeCells = true
  while (lockedSomeCells) {
    lockedSomeCells = false

    // for each missing number, cycle through all the columns where row is missing a cell
    // if all other columns contain the number, then can fill in the cell.
    // Do the same for boxes. Keep looping through until you go through every row without filling in a cell.
    // Then do same thing for columns, then boxes.z
    for (let row = 0; row < grid.length; row++) {
      const missingNums = getRowMissingNums(grid, row)

      missingNums.forEach(n => {
        getRowMissingCells(grid, row).forEach((col, _, missingCellsArray) => {
          if (
            !getColumnLockedNums(grid, col).includes(n) &&
            missingCellsArray
              .filter(cell => cell !== col)
              .every(c => getColumnLockedNums(grid, c).includes(n))
          ) {
            grid[row][col] = { value: n, locked: true }
            lockedSomeCells = true
          }
        })
      })
    }
  }

  return grid
}

const newGrid = lowHangingFruit(startingGrid)

console.log(newGrid)
