import { Grid, CandidatesGrid, CandidatesRow, Row } from '../types'

export const GRID_SIZE = 9
export const sudokuNums = '123456789'.split('')
export const allIndexes = Array.from({ length: GRID_SIZE }, (_, i) => i)

export const boxIndexes = [0, 3, 6]
export const miniGridIndexes = [0, 1, 2]

//************** General helper fns ****************/
export function isFilled(cell: string) {
  return cell !== '.'
}

export function getFilledCellCount(grid: Grid) {
  return grid.map(r => r.filter(isFilled)).flat().length
}

export function arrayIntersection<T>(...arrays: T[][]) {
  return arrays.reduce((acc, cur) => acc.filter(a => cur.includes(a)))
}

export function getColumnArray(grid: Grid, colNum: number) {
  return grid.map(r => r[colNum])
}

export function swapXY(grid: Grid): Grid
export function swapXY(grid: CandidatesGrid): CandidatesGrid
export function swapXY(grid: Grid | CandidatesGrid) {
  return allIndexes.map((c: number) => grid.map(r => r[c]))
}

export function allArraysAreEqual<T>(...arrayOfArrays: T[][]) {
  const firstArr = arrayOfArrays[0]

  return arrayOfArrays
    .slice(1)
    .every(
      a => a.length === firstArr.length && a.every((element, idx) => element === firstArr[idx])
    )
}

export function getUniqueArrays<T>(...arrayOfArrays: T[][]) {
  let uniqueArrays = [arrayOfArrays[0]]

  arrayOfArrays.slice(1).forEach(a => {
    if (uniqueArrays.every(u => !allArraysAreEqual(u, a))) {
      uniqueArrays.push(a)
    }
  })

  return uniqueArrays
}

export function gridHasAnyDeadEnds(grid: Grid) {
  return grid.some((r, rIdx) =>
    r.some((cell, cIdx) => !isFilled(cell) && getCellCandidates(grid, rIdx, cIdx).length === 0)
  )
}

export function getNextEmptyCellCoordinates(
  grid: Grid,
  rowNum: number,
  colNum: number
): [number, number] | undefined {
  let newRowNum = rowNum
  let newColNum = colNum
  const lastIndex = GRID_SIZE - 1

  if (newRowNum === lastIndex && newColNum === lastIndex) return undefined

  if (newColNum === lastIndex) {
    newRowNum += 1
    newColNum = 0
  } else {
    newColNum += 1
  }

  if (!isFilled(grid[newRowNum][newColNum])) return [newRowNum, newColNum]

  return getNextEmptyCellCoordinates(grid, newRowNum, newColNum)
}

export function stringifyGrid(grid: Grid | CandidatesGrid, isPossibleVals = false) {
  const vertSeparator = '|'
  const innerSeparator = `  ${vertSeparator}  `
  const rowBegin = `${vertSeparator}  `
  const rowEnd = `  ${vertSeparator}`
  const pad = rowBegin.length + rowEnd.length
  const horSeparator = '-'
  const boxSeparatorVert = String.fromCharCode(parseInt('275A', 16))
  const boxSeparatorHor = isPossibleVals ? horSeparator : '='

  function replaceCharAt(str: string, i: number, char: string) {
    return str.substring(0, i) + char + str.substring(i + 1)
  }

  let strGrid = horSeparator.repeat((GRID_SIZE - 1) * innerSeparator.length + GRID_SIZE + pad)

  for (let row = 0; row < GRID_SIZE; row++) {
    let logStr = grid[row]
      .map(c => (typeof c === 'string' ? (isFilled(c) ? c : ' ') : c))
      .join(innerSeparator)

    if (!isPossibleVals) {
      logStr = replaceCharAt(logStr, 15, boxSeparatorVert)
      logStr = replaceCharAt(logStr, 33, boxSeparatorVert)
    }

    strGrid += `\n${rowBegin}${logStr}${rowEnd}\n`
    strGrid += ([2, 5].includes(row) ? boxSeparatorHor : horSeparator).repeat(logStr.length + pad)
  }

  return strGrid
}

/* istanbul ignore next */
export function printGrid(grid: Grid) {
  console.log(stringifyGrid(grid))
}

export function seedGrid(input: string): Grid {
  return input
    .split(/\r?\n/)
    .filter(r => r)
    .map(r => [...r])
}

export function getGridCandidates(grid: Grid): CandidatesGrid {
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

//************** Box helper fns ****************/
export function getBoxTopLeft(rowOrCol: number) {
  return rowOrCol - (rowOrCol % 3)
}

export function getBoxCurRow(topLeftRow: number, cell: number) {
  return topLeftRow + Math.floor(cell / 3)
}

export function getBoxCurColumn(topLeftCol: number, cell: number) {
  return topLeftCol + (cell % 3)
}

export function getTopLeftColumnForBoxNum(boxNum: number) {
  return 3 * (boxNum % 3)
}

export function getBoxTopLeftCoordinates(boxNum: number) {
  return [getBoxTopLeft(boxNum), getTopLeftColumnForBoxNum(boxNum)]
}

export function getBoxIndexes(topLeftRowOrColumn: number) {
  return [topLeftRowOrColumn, topLeftRowOrColumn + 1, topLeftRowOrColumn + 2]
}

export function flattenBox(
  grid: CandidatesGrid,
  topLeftRowNum: number,
  topLeftColNum: number
): CandidatesRow
export function flattenBox(grid: Grid, topLeftRowNum: number, topLeftColNum: number): Row
export function flattenBox(
  grid: Grid | CandidatesGrid,
  topLeftRowNum: number,
  topLeftColNum: number
) {
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColNum, topLeftColNum + 3))
    .flat()
}

export function flattenBoxes(grid: Grid): Grid
export function flattenBoxes(grid: CandidatesGrid): CandidatesGrid
export function flattenBoxes(grid: Array<Array<any>>): Grid | CandidatesGrid {
  return boxIndexes.map(r => boxIndexes.map(c => flattenBox(grid, r, c))).flat()
}

export function unflattenBox<T extends string | Row>(boxArray: Array<T>) {
  return boxIndexes.map(i => boxArray.slice(i, i + 3))
}

export function unflattenBoxes(grid: Grid): Grid
export function unflattenBoxes(grid: CandidatesGrid): CandidatesGrid
export function unflattenBoxes(grid: Array<Array<string | Row>>) {
  const arrayLike: ArrayLike<string | Row> = { length: GRID_SIZE }
  const unflattenedGrid = Array.from(arrayLike, () => Array.from(arrayLike))

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

export function rowNeighborsAreFilled(grid: Grid, curRow: number, curCol: number) {
  const topLeftCol = getBoxTopLeft(curCol)

  return grid[curRow]
    .map((cell, index) => ({ cell, index }))
    .slice(topLeftCol, topLeftCol + 3)
    .filter(({ index }) => index !== curCol)
    .every(({ cell }) => isFilled(cell))
}

export function columnNeighborsAreFilled(grid: Grid, curRow: number, curCol: number) {
  return rowNeighborsAreFilled(swapXY(grid), curCol, curRow)
}

export function rowNeighborsContainNumber(grid: Grid, curRow: number, num: string) {
  return getBoxIndexes(getBoxTopLeft(curRow))
    .filter(r => r !== curRow)
    .every(r => getFilledNums(grid[r]).includes(num))
}

export function columnNeighborsContainNumber(grid: Grid, curCol: number, num: string) {
  return getBoxIndexes(getBoxTopLeft(curCol))
    .filter(c => c !== curCol)
    .every(c => getColumnFilledNums(grid, c).includes(num))
}

export function getCellCandidates(grid: Grid, rowNum: number, colNum: number) {
  const rowMissingNums = getRowMissingNums(grid, rowNum)
  const colMissingNums = getColumnMissingNums(grid, colNum)
  const boxMissingNums = getBoxMissingNums(grid, getBoxTopLeft(rowNum), getBoxTopLeft(colNum))

  return arrayIntersection(rowMissingNums, colMissingNums, boxMissingNums)
}

//************** Filled Nums fns ****************/
export function getFilledNums(arr: Array<string>) {
  return arr.filter(isFilled)
}

export function getColumnFilledNums(grid: Grid, colNum: number) {
  return getFilledNums(getColumnArray(grid, colNum))
}

//************** Missing Nums fns ****************/
export function getMissingNums(arr: Array<string>) {
  return sudokuNums.filter(n => !getFilledNums(arr).includes(n))
}

export function getRowMissingNums(grid: Grid, rowNum: number) {
  return getMissingNums(grid[rowNum])
}

export function getColumnMissingNums(grid: Grid, colNum: number) {
  return getMissingNums(getColumnArray(grid, colNum))
}

export function getBoxMissingNums(grid: Grid, topLeftRowNum: number, topLeftColNum: number) {
  return getMissingNums(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

//************** Missing Cells fns ****************/
export function getMissingCells(arr: Row) {
  return arr
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !isFilled(cell))
    .map(({ index }) => index)
}

export function getRowMissingCells(grid: Grid, rowNum: number) {
  return getMissingCells(grid[rowNum])
}

export function getColumnMissingCells(grid: Grid, colNum: number) {
  return getMissingCells(getColumnArray(grid, colNum))
}

export function getBoxMissingCells(grid: Grid, topLeftRowNum: number, topLeftColNum: number) {
  return getMissingCells(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

//************** validity fns ****************/
export function isValid(arr: Row) {
  const filledNums = getFilledNums(arr)

  return (
    allArraysAreEqual(filledNums, [...new Set(filledNums)]) &&
    filledNums.every(n => sudokuNums.includes(n))
  )
}

export function everyRowIsValid(grid: Grid) {
  return grid.every(isValid)
}

export function columnIsValid(grid: Grid, colNum: number) {
  return isValid(getColumnArray(grid, colNum))
}

export function everyColumnIsValid(grid: Grid) {
  return everyRowIsValid(swapXY(grid))
}

export function boxIsValid(grid: Grid, topLeftRowNum: number, topLeftColNum: number) {
  return isValid(flattenBox(grid, topLeftRowNum, topLeftColNum))
}

export function everyBoxIsValid(grid: Grid) {
  return everyRowIsValid(flattenBoxes(grid))
}

export function gridIsValid(grid: Grid) {
  return everyRowIsValid(grid) && everyColumnIsValid(grid) && everyBoxIsValid(grid)
}

//************** completeness fns ****************/
export function gridIsComplete(grid: Grid) {
  return gridIsValid(grid) && grid.every(r => r.every(isFilled))
}
