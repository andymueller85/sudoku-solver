const startingGrid = require('fs')
  .readFileSync('./input.txt', 'utf8')
  .split(/\r?\n/)
  .filter(d => d)
  .map(d => [...d].map(c => c))

const GRID_SIZE = 9
const EMPTY_CELL = '.'

const nums = '123456789'.split('')

function rowIsGood(grid, rowNum) {
  return grid[rowNum].sort().join('') === nums.join('')
}

function getRowMissingNums(grid, rowNum) {
  return nums.filter(n => !grid[rowNum].includes(n))
}

function columnIsGood(grid, columnNum) {
  return (
    grid
      .map(r => r[columnNum])
      .sort()
      .join('') === nums.join('')
  )
}

function getColumnMissingNums(grid, columnNum) {
  return nums.filter(n => !grid.map(r => r[columnNum]).includes(n))
}

function getKnownCells(grid) {
  let knownCells = []
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] !== EMPTY_CELL) knownCells.push(i * grid.length + j + 1)
    }
  }
  return knownCells
}

function boxIsGood(grid, topLeftRowNum, topLeftColumnNum) {
  return (
    grid
      .slice(topLeftRowNum, topLeftRowNum + 3)
      .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
      .flat()
      .sort()
      .join('') === nums.join
  )
}

function getBoxMissingNums(grid, topLeftRowNum, topLeftColumnNum) {
  return nums.filter(
    n =>
      !grid
        .slice(topLeftRowNum, topLeftRowNum + 3)
        .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
        .flat()
        .includes(n)
  )
}

// function fillInObviousRows(grid) {
//   const
// }

console.log(getBoxMissingNums(startingGrid, 3,0))
