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
export const axis = { x: 'X', y: 'Y' }

function isFilled(cell) {
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
  return grid[rowNum]
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !isFilled(cell))
    .map(({ index }) => index)
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
  return grid
    .map(r => r[columnNum])
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !isFilled(cell))
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
    .every(c => isFilled(c))
}

export function boxIsValid(grid, topLeftRowNum, topLeftColumnNum) {
  return (
    JSON.stringify(
      [
        ...getBoxFilledNums(grid, topLeftRowNum, topLeftColumnNum),
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
  return grid
    .slice(topLeftRowNum, topLeftRowNum + 3)
    .map(r => r.slice(topLeftColumnNum, topLeftColumnNum + 3))
    .flat()
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !isFilled(cell))
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

function cellCanBeDeterminedForBox(grid, cell, topLeftRow, topLeftColumn, num) {
  const curRow = getBoxCurRow(topLeftRow, cell)
  const curColumn = getBoxCurColumn(topLeftColumn, cell)

  const rowNeighborsAreFilled = grid[curRow]
    .map((cell, index) => ({ cell, index }))
    .slice(topLeftColumn, topLeftColumn + 3)
    .filter(({  index  }) =>  index !== curColumn)
    .every(({cell}) => isFilled(cell))

  const rowNeighborsContainNum = getBoxIndexes(topLeftRow)
    .filter(r => r !== curRow)
    .every(r => getRowFilledNums(grid, r).includes(num))

  const columnNeighborsAreFilled = grid
    .map(r => r[curColumn])
    .map((cell, index) => ({ cell, index }))
    .slice(topLeftRow, topLeftRow + 3)
    .filter(({index}) => index !== curRow)
    .every(({cell}) => isFilled(cell))

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

function log(grid, loopCount, msg) {
  if (DEBUG) {
    console.log(`Pass ${loopCount} ${msg}`)
    console.log(`${stringifyGrid(grid)}\n\n`)
  }
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

    if (!gridIsValid(updatedGrid)) {
      printGrid(updatedGrid)
      throw 'uh-oh'
    }

    filledCellCount = getFilledCellCount(updatedGrid)
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

export function getNextCellCoordinates(rowNum, colNum) {
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

export function fillInAllCellsRecursive(grid) {
  if (getFilledCellCount(grid) === GRID_SIZE ** 2) return grid
  let finalGrid = undefined
  let count = 0

  function recurse(myGrid, curRow = 0, curCol = 0) {
    count++
    if (count % 1000 === 0) {
      console.log(count)
      console.log(stringifyGrid(myGrid))
    }
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

            const nextCoordinates = getNextCellCoordinates(rowNum, colNum)

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

export function printGrid(grid) {
  console.log(stringifyGrid(grid))
}

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
  console.log('After rest:', getFilledCellCount(finalGrid))
  console.log('Time:', Date.now() - t1)
}
