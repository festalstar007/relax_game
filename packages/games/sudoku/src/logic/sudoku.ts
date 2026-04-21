export type SudokuSize = 4 | 6 | 8 | 9;

export interface SudokuConfig {
  size: SudokuSize;
  boxRows: number;
  boxCols: number;
}

export const CONFIGS: Record<SudokuSize, SudokuConfig> = {
  4: { size: 4, boxRows: 2, boxCols: 2 },
  6: { size: 6, boxRows: 2, boxCols: 3 },
  8: { size: 8, boxRows: 2, boxCols: 4 },
  9: { size: 9, boxRows: 3, boxCols: 3 },
};

export type Grid = (number | null)[][];

export class SudokuEngine {
  private config: SudokuConfig;

  constructor(size: SudokuSize = 6) {
    this.config = CONFIGS[size];
  }

  /**
   * 检查在 (row, col) 放入 num 是否合法
   */
  isValid(grid: Grid, row: number, col: number, num: number): boolean {
    const { size, boxRows, boxCols } = this.config;

    // 检查行
    for (let i = 0; i < size; i++) {
      if (grid[row][i] === num) return false;
    }

    // 检查列
    for (let i = 0; i < size; i++) {
      if (grid[i][col] === num) return false;
    }

    // 检查宫
    const startRow = Math.floor(row / boxRows) * boxRows;
    const startCol = Math.floor(col / boxCols) * boxCols;
    for (let i = 0; i < boxRows; i++) {
      for (let j = 0; j < boxCols; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  }

  /**
   * 生成一个完整的终盘
   */
  generateSolution(): Grid {
    const { size } = this.config;
    const grid: Grid = Array.from({ length: size }, () => Array(size).fill(null));
    this.fillGrid(grid);
    return grid;
  }

  private fillGrid(grid: Grid): boolean {
    const { size } = this.config;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === null) {
          const numbers = this.shuffle(Array.from({ length: size }, (_, i) => i + 1));
          for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.fillGrid(grid)) return true;
              grid[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 生成谜题（初盘）
   * @param difficulty 难度，0-1 之间，越大越难（挖空越多）
   */
  generatePuzzle(difficulty: number = 0.5): { puzzle: Grid; solution: Grid } {
    const solution = this.generateSolution();
    const { size } = this.config;
    const puzzle: Grid = solution.map(row => [...row]);
    
    // 简单的挖洞算法
    const totalCells = size * size;
    let attempts = Math.floor(totalCells * difficulty);
    
    while (attempts > 0) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      
      if (puzzle[row][col] !== null) {
        puzzle[row][col] = null;
        attempts--;
      }
    }

    return { puzzle, solution };
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * 检查游戏是否胜利
   */
  checkWin(grid: Grid): boolean {
    const { size } = this.config;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const val = grid[r][c];
        if (val === null) return false;
        // 临时移除并检查是否仍然合法
        grid[r][c] = null;
        const valid = this.isValid(grid, r, c, val);
        grid[r][c] = val;
        if (!valid) return false;
      }
    }
    return true;
  }
}
