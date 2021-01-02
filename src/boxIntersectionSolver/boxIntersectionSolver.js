import lodash from 'lodash'
import {
  allIndexes,
  boxIndexes,
  flattenBox,
  getBoxCurColumn,
  getBoxCurRow,
  possibleNums,
  swapXY
} from '../helpers/helpers.js'
import { miniGridIndexes } from '../helpers/helpers.js'

const { cloneDeep } = lodash

/************** box intersections solver fns ****************/
export function getImpossibilities(arr) {
  return possibleNums.filter(
    p => ![...new Set(arr.reduce((acc, cur) => acc.concat(cur)))].includes(p)
  )
}

export function getOtherIndexes(i) {
  return allIndexes.filter(p => p < i * 3 || p > i * 3 + 2)
}

export function processBoxIntersections(possibleValsGrid, topLeftRowNum, topLeftColNum) {
  let myGrid = cloneDeep(possibleValsGrid)
  const flatBox = flattenBox(myGrid, topLeftRowNum, topLeftColNum)

  miniGridIndexes.forEach(i => {
    const row = myGrid[topLeftRowNum + i]
    const boxOtherIndexes = getOtherIndexes(i)
    const outsideOtherIndexes = getOtherIndexes(topLeftColNum / 3)
    const outsideBoxImpossibilities = getImpossibilities(outsideOtherIndexes.map(i => row[i]))
    const insideBoxImpossibilities = getImpossibilities(boxOtherIndexes.map(i => flatBox[i]))

    boxOtherIndexes.forEach(idx => {
      const gridRow = getBoxCurRow(topLeftRowNum, idx)
      const gridCol = getBoxCurColumn(topLeftColNum, idx)

      myGrid[gridRow][gridCol] = flatBox[idx].filter(n => !outsideBoxImpossibilities.includes(n))
    })

    outsideOtherIndexes.forEach(idx => {
      myGrid[topLeftRowNum + i][idx] = row[idx].filter(n => !insideBoxImpossibilities.includes(n))
    })
  })

  return myGrid
}

export function allBoxIntersections(possibleValsGrid) {
  let myGrid = cloneDeep(possibleValsGrid)

  boxIndexes.forEach(r => {
    boxIndexes.forEach(c => {
      myGrid = processBoxIntersections(myGrid, r, c)
    })
  })

  return myGrid
}

export function rowAndColBoxIntersections(possibleValsGrid) {
  let myGrid = cloneDeep(possibleValsGrid)

  myGrid = allBoxIntersections(myGrid)
  myGrid = swapXY(allBoxIntersections(swapXY(myGrid)))

  return myGrid
}

