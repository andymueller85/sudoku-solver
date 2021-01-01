# sudoku-solver

![Node.js CI](https://github.com/andymueller85/sudoku-solver/workflows/Node.js%20CI/badge.svg)

This application solves Sudoku puzzles using various strategies that people might use. The strategies are:
* **basic** - just apply logic to look for numbers in neighborking rows, columns & boxes. Use process of elimination to fill cells
* **Matching Sets** - _explanation needed here_ 
* **Box Intersection** - _explanation needed here_

Currently, input is pretty crude. There are a few input files at the root of the project. To change input, modify this [line of code](https://github.com/andymueller85/sudoku-solver/blob/77a4a83f0cd407b02e6f8e4e2c25bac696cbf42d/src/main.js#L23) in `main.js`:
```js
const inputName = 'input_evil.txt'
```

## To run

### Install dependencies with
`yarn install`
### Start with
`yarn start`
