# sudoku-solver

![Node.js CI](https://github.com/andymueller85/sudoku-solver/workflows/Node.js%20CI/badge.svg)

## Description
This application solves Sudoku puzzles using various strategies that people might use. The strategies are:
### Basic 
* Just apply logic to look for numbers in neighboring rows, columns & boxes. Use process of elimination to fill cells
  
### Matching Sets
* This works by finding sets of possible values for cells in a row, box or column. For instance if a row has two cells where the possible values are `[1, 2]`, then 1 or 2 must be in one of those columns. Those values can be removed as possiblities for all other cells in the set. This works where the number of matching sets equals the number of possible numbers in the matching set. For example, if the matching values were `[1, 2, 3]`, then there must be 3 matches in orderto apply this rule 
  
### Box Intersection 
* This works by processing boxes. Each box has 3 intersecting rows and 3 intersecting columns. For each sub-row inside a box, the row cells outside of the box must match the cells of the other two rows inside the box. Therefore if it can be determined that `[1,2]` can't exist in the sub-row outside of the box, then those numbers also can't exist for the other rows inside the box, and vice versa. The same rules apply for columns.

If a puzzle isn't solved after iteravely applying the above rules, then it will try to solve the puzzle, recursively trying possible numbers for each empty cell.

Currently, input is pretty crude. There are a few input files at the root of the project. To change input, modify `inputName` in [main.js](https://github.com/andymueller85/sudoku-solver/blob/77a4a83f0cd407b02e6f8e4e2c25bac696cbf42d/src/main.js#L23):
```js
const inputName = 'input_evil.txt'
```
## To run

### Install dependencies with
`yarn install`
### Start with
`yarn start`
