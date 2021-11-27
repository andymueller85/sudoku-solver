export type SudokuNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type SudokuNumberOrEmpty = SudokuNumber | '.'
export type Row = Array<SudokuNumberOrEmpty>
export type Grid = Array<Row>

export type CandidatesRow = Array<Array<SudokuNumber>>
export type CandidatesGrid = Array<CandidatesRow>

export type GridWithMeta = { grid: Grid; iterations: number }
export type Matches = { candidates: Array<SudokuNumber>; matches: Array<number> }
