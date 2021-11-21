import lodash from 'lodash'
import {
  allIndexes,
  boxIndexes,
  flattenBox,
  getBoxCurColumn,
  getBoxCurRow,
  sudokuNums,
  swapXY
} from '../helpers/helpers'
import { miniGridIndexes } from '../helpers/helpers'
import { CandidatesGrid, CandidatesRow } from '../types'

const { cloneDeep } = lodash

export function getImpossibilities(arr: CandidatesRow) {
  return sudokuNums.filter(
    p => ![...new Set(arr.reduce((acc, cur) => acc.concat(cur)))].includes(p)
  )
}

export function getOtherIndexes(i: number) {
  return allIndexes.filter(p => p < i * 3 || p > i * 3 + 2)
}

export function processBoxRowIntersections(
  candidatesGrid: CandidatesGrid,
  topLeftRowNum: number,
  topLeftColNum: number
) {
  let myGrid = cloneDeep(candidatesGrid)
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

export function allBoxRowIntersections(candidatesGrid: CandidatesGrid) {
  let myGrid = cloneDeep(candidatesGrid)

  boxIndexes.forEach(r => {
    boxIndexes.forEach(c => {
      myGrid = processBoxRowIntersections(myGrid, r, c)
    })
  })

  return myGrid
}

export function rowAndColBoxIntersections(candidatesGrid: CandidatesGrid) {
  let myGrid = cloneDeep(candidatesGrid)

  myGrid = allBoxRowIntersections(myGrid)
  myGrid = swapXY(allBoxRowIntersections(swapXY(myGrid)))

  return myGrid
}
