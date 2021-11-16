import lodash from 'lodash'
import {
  allIndexes,
  flattenBoxes,
  getUniqueArrays,
  GRID_SIZE,
  swapXY,
  unflattenBoxes
} from '../helpers/helpers'
import { Matches, PossiblesGrid, PossiblesRow } from '../types'

const { cloneDeep } = lodash

export function findMatches(arr: PossiblesRow): Array<Matches> {
  return arr.map((c, arrIdx, cells) => ({
    possibles: c,
    matches: cells
      .map((vals, idx) => ({ vals, idx }))
      .filter(
        ({ vals, idx }) =>
          arrIdx !== idx && vals.length === c.length && vals.every((v, i) => v === c[i])
      )
      .map(({ idx }) => idx)
  }))
}

export function whittlePossibles(
  matches: Array<Matches[]>,
  possiblesGrid: PossiblesGrid
): PossiblesGrid {
  let possibleValsGrid = cloneDeep(possiblesGrid)

  for (let n = 2; n < GRID_SIZE; n++) {
    matches.forEach((m, rowIdx: number) => {
      const matchesOfSizeN = m.filter(r => r.matches.length > 0 && r.possibles.length === n)

      if (matchesOfSizeN.length === n) {
        const matchingSets = getUniqueArrays(...matchesOfSizeN.map(m => m.possibles))

        matchingSets.forEach(possibles => {
          const setIndexes = [...new Set(matchesOfSizeN.map(m => m.matches).flat())]

          allIndexes
            .filter(n => !setIndexes.includes(n))
            .forEach(colIdx => {
              possibleValsGrid[rowIdx][colIdx] = possibleValsGrid[rowIdx][colIdx].filter(
                (v, _, a) => n > a.length || !possibles.includes(v)
              )
            })
        })
      }
    })
  }

  return possibleValsGrid
}

export function processRowMatchingSets(possibleValsGrid: PossiblesGrid) {
  return whittlePossibles(possibleValsGrid.map(findMatches), possibleValsGrid)
}

export function processColumnMatchingSets(possibleValsGrid: PossiblesGrid) {
  const swappedGrid = swapXY(possibleValsGrid)
  const columnMatches = swappedGrid.map(findMatches)

  return swapXY(whittlePossibles(columnMatches, swappedGrid))
}

export function processBoxMatchingSets(possibleValsGrid: PossiblesGrid) {
  const flattenedBoxGrid = flattenBoxes(possibleValsGrid)
  const boxMatches = flattenedBoxGrid.map(findMatches)

  return unflattenBoxes(whittlePossibles(boxMatches, flattenedBoxGrid))
}

export function processMatchingSets(possibleValsGrid: PossiblesGrid) {
  let myGrid = processBoxMatchingSets(possibleValsGrid)
  myGrid = processColumnMatchingSets(myGrid)
  myGrid = processRowMatchingSets(myGrid)

  return myGrid
}
