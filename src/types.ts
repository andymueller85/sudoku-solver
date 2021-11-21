export type Row = Array<string>
export type Grid = Array<Row>

export type CandidatesRow = Array<Array<string>>
export type CandidatesGrid = Array<CandidatesRow>

export type GridWithMeta = { grid: Grid; iterations: number }
export type Matches = { candidates: Array<string>; matches: Array<number> }
