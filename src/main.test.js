import { expect } from '@jest/globals'
import * as main from './main'

describe('rowIsComplete', () => {
  test('should return true if every element of a row is locked', () => {
    const grid = Array.from({ length: 5 }).map(r =>
      Array.from({ length: 5 }, c => ({
        locked: true
      }))
    )

    expect(main.rowIsComplete(grid, 1)).toBeTruthy
  })
})
