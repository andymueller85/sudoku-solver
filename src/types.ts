export enum SudokuNumber {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9'
}

export const EMPTY_CELL = '.'
export type SudokuNumberOrEmpty = SudokuNumber | typeof EMPTY_CELL

export type Row = Array<SudokuNumberOrEmpty>
export type Grid = Array<Row>

export type CandidatesRow = Array<Array<SudokuNumber>>
export type CandidatesGrid = Array<CandidatesRow>

export type GridWithMeta = { grid: Grid; iterations: number }
export type Matches = { candidates: Array<SudokuNumber>; matches: Array<number> }
