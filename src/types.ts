export type Row = Array<string>
export type Grid = Array<Row>

export type PossiblesRow = Array<Array<string>>
export type PossiblesGrid = Array<PossiblesRow>

export type GridWithMeta = { grid: Grid | undefined; recursiveIterations: number }
export type Matches = { possibles: Array<string>; matches: Array<number> }
