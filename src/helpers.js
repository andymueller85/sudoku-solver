export const GRID_SIZE = 9
export const possibleNums = '123456789'.split('')
export const allIndexes = Array.from({ length: GRID_SIZE }, (_, i) => i)
export const boxIndexes = [0, 3, 6]

/************** General helper fns ****************/
export function isFilled(cell) {
  return cell !== '.'
}

export function getFilledCellCount(grid) {
  return grid.map(r => r.filter(c => isFilled(c))).flat().length
}

export function arrayIntersection(...arrays) {
  return arrays.reduce((acc, cur) => acc.filter(a => cur.includes(a)))
}

export function getColumnArray(grid, colNum) {
  return grid.map(r => r[colNum])
}

export function swapXY(grid) {
  return allIndexes.map(c => grid.map(r => r[c]))
}

export function allArraysAreEqual(...arrayOfArrays) {
  const firstArr = arrayOfArrays[0]

  return arrayOfArrays
    .slice(1)
    .every(
      a => a.length === firstArr.length && a.every((element, idx) => element === firstArr[idx])
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

export function gridHasAnyDeadEnds(grid) {
  return grid.some((r, rIdx) =>
    r.some(
      (_, cIdx) =>
        !isFilled(grid[rIdx][cIdx]) && getPossibleCellValues(grid, rIdx, cIdx).length === 0
    )
  )
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

/************** Box helper fns ****************/
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

export function getBoxTopLeftCoordinates(boxNum) {
  return [getBoxTopLeft(boxNum), getTopLeftColumnForBoxNum(boxNum)]
}

function getBoxIndexes(topLeftRowOrColumn) {
  return [topLeftRowOrColumn, topLeftRowOrColumn + 1, topLeftRowOrColumn + 2]
}

export function flattenBox(grid, topLeftRowNum, topLeftColNum) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColNum, topLeftColNum + 3))
    .flat()
}

export function unflattenBox(boxArray) {
  return boxIndexes.map(i => boxArray.slice(i, i + 3))
}

export function flattenBoxes(grid) {
  return boxIndexes.map(r => boxIndexes.map(c => flattenBox(grid, r, c))).flat()
}

export function unflattenBoxes(grid) {
  let unflattenedGrid = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }))

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

export function rowNeighborsAreFilled(grid, topLeftColumn, curRow, curCol) {
  return grid[curRow]
    .map((cell, index) => ({ cell, index }))
    .slice(topLeftColumn, topLeftColumn + 3)
    .filter(({ index }) => index !== curCol)
    .every(({ cell }) => isFilled(cell))
}

export function columnNeighborsAreFilled(grid, topLeftRow, curRow, curCol) {
  return rowNeighborsAreFilled(swapXY(grid), topLeftRow, curCol, curRow)
}

export function rowNeighborsContainNumber(grid, topLeftRow, curRow, num) {
  return getBoxIndexes(topLeftRow)
    .filter(r => r !== curRow)
    .every(r => getFilledNums(grid[r]).includes(num))
}

export function columnNeighborsContainNumber(grid, topLeftCol, curCol, num) {
  return getBoxIndexes(topLeftCol)
    .filter(c => c !== curCol)
    .every(c => getColumnFilledNums(grid, c).includes(num))
}

export function getPossibleCellValues(grid, rowNum, colNum) {
  const rowMissingNums = getRowMissingNums(grid, rowNum)
  const colMissingNums = getColumnMissingNums(grid, colNum)
  const boxMissingNums = getBoxMissingNums(grid, getBoxTopLeft(rowNum), getBoxTopLeft(colNum))

  return arrayIntersection(rowMissingNums, colMissingNums, boxMissingNums)
}

/************** Filled Nums fns ****************/
export function getFilledNums(arr) {
  return arr.filter(c => isFilled(c))
}

export function getRowFilledNums(grid, rowNum) {
  return getFilledNums(grid[rowNum])
}

export function getColumnFilledNums(grid, colNum) {
  return getFilledNums(getColumnArray(grid, colNum))
}

export function getBoxFilledNums(grid, topLeftRowNum, topLeftColNum) {
  return getFilledNums(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

/************** Missing Nums fns ****************/
export function getMissingNums(arr) {
  return possibleNums.filter(n => !getFilledNums(arr).includes(n))
}

export function getRowMissingNums(grid, rowNum) {
  return getMissingNums(grid[rowNum])
}

export function getColumnMissingNums(grid, colNum) {
  return getMissingNums(getColumnArray(grid, colNum))
}

export function getBoxMissingNums(grid, topLeftRowNum, topLeftColNum) {
  return getMissingNums(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

/************** Missing Cells fns ****************/
export function getMissingCells(arr) {
  return arr
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !isFilled(cell))
    .map(({ index }) => index)
}

export function getRowMissingCells(grid, rowNum) {
  return getMissingCells(grid[rowNum])
}

export function getColumnMissingCells(grid, colNum) {
  return getMissingCells(getColumnArray(grid, colNum))
}

export function getBoxMissingCells(grid, topLeftRowNum, topLeftColNum) {
  return getMissingCells(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

/************** validity fns ****************/
export function isValid(arr) {
  const filledNums = getFilledNums(arr)

  return (
    allArraysAreEqual(filledNums, [...new Set(filledNums)]) &&
    filledNums.every(n => possibleNums.includes(n))
  )
}

export function rowIsValid(grid, rowNum) {
  return isValid(grid[rowNum])
}

export function everyRowIsValid(grid) {
  return grid.every((_, rowNum) => rowIsValid(grid, rowNum))
}

export function columnIsValid(grid, colNum) {
  return isValid(getColumnArray(grid, colNum))
}

export function everyColumnIsValid(grid) {
  return everyRowIsValid(swapXY(grid))
}

export function boxIsValid(grid, topLeftRowNum, topLeftColNum) {
  return isValid(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

export function everyBoxIsValid(grid) {
  return everyRowIsValid(flattenBoxes(grid))
}

export function gridIsValid(grid) {
  return everyRowIsValid(grid) && everyColumnIsValid(grid) && everyBoxIsValid(grid)
}

/************** completeness fns ****************/
export function isComplete(arr) {
  return isValid(arr) && arr.every(c => isFilled(c))
}

export function rowIsComplete(grid, rowNum) {
  return isComplete(grid[rowNum])
}

export function columnIsComplete(grid, colNum) {
  return isComplete(getColumnArray(grid, colNum))
}

export function boxIsComplete(grid, topLeftRowNum, topLeftColNum) {
  return isComplete(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

export function gridIsComplete(grid) {
  return gridIsValid(grid) && grid.every(r => r.every(c => isFilled(c)))
}
