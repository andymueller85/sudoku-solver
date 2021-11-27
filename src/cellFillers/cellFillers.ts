import lodash from 'lodash'
import {
  columnNeighborsAreFilled,
  columnNeighborsContainNumber,
  getBoxCurColumn,
  getBoxCurRow,
  getBoxMissingCells,
  getBoxMissingNums,
  getBoxTopLeft,
  getColumnFilledNums,
  getColumnMissingNums,
  getMissingNums,
  getRowMissingCells,
  getRowMissingNums,
  rowNeighborsAreFilled,
  rowNeighborsContainNumber,
  swapXY
} from '../helpers/helpers'
import { Grid, SudokuNumber } from '../types'

const { cloneDeep } = lodash

export function cellCanBeDeterminedForRow(
  grid: Grid,
  rowNum: number,
  colNum: number,
  num: SudokuNumber
) {
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

export function fillRows(grid: Grid) {
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

/* aka Phil Collims */
export function fillColumns(grid: Grid) {
  return swapXY(fillRows(swapXY(grid)))
}

export function cellCanBeDeterminedForBox(
  grid: Grid,
  cell: number,
  topLeftRow: number,
  topLeftCol: number,
  num: SudokuNumber
) {
  const curRow = getBoxCurRow(topLeftRow, cell)
  const curCol = getBoxCurColumn(topLeftCol, cell)
  const rNeighborsFilled = rowNeighborsAreFilled(grid, curRow, curCol)
  const rNeighborsContainNum = rowNeighborsContainNumber(grid, curRow, num)
  const cNeighborsAreFilled = columnNeighborsAreFilled(grid, curRow, curCol)
  const cNeighborsContainNum = columnNeighborsContainNumber(grid, curCol, num)
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

export function fillBoxes(grid: Grid) {
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
