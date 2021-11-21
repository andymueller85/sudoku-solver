import lodash from 'lodash'
import {
  allIndexes,
  flattenBoxes,
  getUniqueArrays,
  GRID_SIZE,
  swapXY,
  unflattenBoxes
} from '../helpers/helpers'
import { Matches, CandidatesGrid, CandidatesRow } from '../types'

const { cloneDeep } = lodash

export function findMatches(arr: CandidatesRow): Array<Matches> {
  return arr.map((c, arrIdx, cells) => ({
    candidates: c,
    matches: cells
      .map((vals, idx) => ({ vals, idx }))
      .filter(
        ({ vals, idx }) =>
          arrIdx !== idx && vals.length === c.length && vals.every((v, i) => v === c[i])
      )
      .map(({ idx }) => idx)
  }))
}

export function whittleCandidates(
  matches: Array<Matches[]>,
  candidatesGrid: CandidatesGrid
): CandidatesGrid {
  let candidatesGridClone = cloneDeep(candidatesGrid)

  for (let n = 2; n < GRID_SIZE; n++) {
    matches.forEach((m, rowIdx: number) => {
      const matchesOfSizeN = m.filter(r => r.matches.length > 0 && r.candidates.length === n)

      if (matchesOfSizeN.length === n) {
        const matchingSets = getUniqueArrays(...matchesOfSizeN.map(m => m.candidates))

        matchingSets.forEach(candidates => {
          const setIndexes = [...new Set(matchesOfSizeN.map(m => m.matches).flat())]

          allIndexes
            .filter(n => !setIndexes.includes(n))
            .forEach(colIdx => {
              candidatesGridClone[rowIdx][colIdx] = candidatesGridClone[rowIdx][colIdx].filter(
                (v, _, a) => n > a.length || !candidates.includes(v)
              )
            })
        })
      }
    })
  }

  return candidatesGridClone
}

export function processRowMatchingSets(candidatesGrid: CandidatesGrid) {
  return whittleCandidates(candidatesGrid.map(findMatches), candidatesGrid)
}

export function processColumnMatchingSets(candidatesGrid: CandidatesGrid) {
  const swappedGrid = swapXY(candidatesGrid)
  const columnMatches = swappedGrid.map(findMatches)

  return swapXY(whittleCandidates(columnMatches, swappedGrid))
}

export function processBoxMatchingSets(candidatesGrid: CandidatesGrid) {
  const flattenedBoxGrid = flattenBoxes(candidatesGrid)
  const boxMatches = flattenedBoxGrid.map(findMatches)

  return unflattenBoxes(whittleCandidates(boxMatches, flattenedBoxGrid))
}

export function processMatchingSets(candidatesGrid: CandidatesGrid) {
  let myGrid = processBoxMatchingSets(candidatesGrid)
  myGrid = processColumnMatchingSets(myGrid)
  myGrid = processRowMatchingSets(myGrid)

  return myGrid
}
