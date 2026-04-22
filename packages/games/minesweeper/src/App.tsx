import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import './App.css'

type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

const ROWS = 10
const COLS = 10
const MINE_COUNT = 15

const OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    })),
  )
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS
}

function getNeighbors(row: number, col: number): Array<[number, number]> {
  return OFFSETS.map(([dr, dc]) => [row + dr, col + dc] as [number, number]).filter(
    ([nextRow, nextCol]) => inBounds(nextRow, nextCol),
  )
}

function placeMines(board: Cell[][], safeRow: number, safeCol: number): void {
  const protectedCells = new Set<string>([`${safeRow},${safeCol}`])

  for (const [row, col] of getNeighbors(safeRow, safeCol)) {
    protectedCells.add(`${row},${col}`)
  }

  const candidates: Array<[number, number]> = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (!protectedCells.has(`${row},${col}`)) {
        candidates.push([row, col])
      }
    }
  }

  const mineLimit = Math.min(MINE_COUNT, candidates.length)
  for (let i = 0; i < mineLimit; i += 1) {
    const randomIndex = Math.floor(Math.random() * candidates.length)
    const [row, col] = candidates.splice(randomIndex, 1)[0]
    board[row][col].isMine = true
  }
}

function calculateAdjacentMines(board: Cell[][]): void {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (board[row][col].isMine) {
        continue
      }

      let count = 0
      for (const [nextRow, nextCol] of getNeighbors(row, col)) {
        if (board[nextRow][nextCol].isMine) {
          count += 1
        }
      }
      board[row][col].adjacentMines = count
    }
  }
}

function buildBoard(safeRow: number, safeCol: number): Cell[][] {
  const board = createEmptyBoard()
  placeMines(board, safeRow, safeCol)
  calculateAdjacentMines(board)
  return board
}

function revealConnectedCells(board: Cell[][], startRow: number, startCol: number): void {
  const queue: Array<[number, number]> = [[startRow, startCol]]

  while (queue.length > 0) {
    const [row, col] = queue.shift()!
    const cell = board[row][col]

    if (cell.isRevealed || cell.isFlagged) {
      continue
    }

    cell.isRevealed = true

    if (cell.isMine || cell.adjacentMines > 0) {
      continue
    }

    for (const [nextRow, nextCol] of getNeighbors(row, col)) {
      const nextCell = board[nextRow][nextCol]
      if (!nextCell.isMine && !nextCell.isRevealed && !nextCell.isFlagged) {
        queue.push([nextRow, nextCol])
      }
    }
  }
}

function revealAllMines(board: Cell[][]): void {
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) {
        cell.isRevealed = true
      }
    }
  }
}

function hasWon(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) {
        return false
      }
    }
  }
  return true
}

function countFlags(board: Cell[][]): number {
  let count = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) {
        count += 1
      }
    }
  }
  return count
}

function statusText(status: GameStatus): string {
  if (status === 'won') {
    return '挑战成功'
  }
  if (status === 'lost') {
    return '踩雷了'
  }
  if (status === 'playing') {
    return '进行中'
  }
  return '准备开始'
}

function App() {
  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard())
  const [status, setStatus] = useState<GameStatus>('ready')
  const [seconds, setSeconds] = useState(0)

  const minesLeft = useMemo(() => MINE_COUNT - countFlags(board), [board])

  useEffect(() => {
    if (status !== 'playing') {
      return
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [status])

  function restartGame(): void {
    setBoard(createEmptyBoard())
    setStatus('ready')
    setSeconds(0)
  }

  function handleCellClick(row: number, col: number): void {
    if (status === 'won' || status === 'lost') {
      return
    }

    const currentCell = board[row][col]
    if (currentCell.isRevealed || currentCell.isFlagged) {
      return
    }

    let nextBoard = cloneBoard(board)
    let nextStatus: GameStatus = status

    if (status === 'ready') {
      nextBoard = buildBoard(row, col)
      nextStatus = 'playing'
    }

    const targetCell = nextBoard[row][col]
    if (targetCell.isMine) {
      targetCell.isRevealed = true
      revealAllMines(nextBoard)
      setBoard(nextBoard)
      setStatus('lost')
      return
    }

    revealConnectedCells(nextBoard, row, col)

    if (hasWon(nextBoard)) {
      revealAllMines(nextBoard)
      setStatus('won')
    } else {
      setStatus(nextStatus)
    }

    setBoard(nextBoard)
  }

  function handleContextMenu(
    event: MouseEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ): void {
    event.preventDefault()

    if (status === 'won' || status === 'lost') {
      return
    }

    setBoard((previousBoard) => {
      const nextBoard = cloneBoard(previousBoard)
      const cell = nextBoard[row][col]

      if (cell.isRevealed) {
        return previousBoard
      }

      cell.isFlagged = !cell.isFlagged
      return nextBoard
    })
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>扫雷小游戏</h1>
        <p className="hint">左键开格，右键插旗，首击安全。</p>
        <div className="status-row">
          <span>状态：{statusText(status)}</span>
          <span>剩余雷数：{minesLeft}</span>
          <span>用时：{seconds}s</span>
        </div>
        <button type="button" className="restart-button" onClick={restartGame}>
          重新开始
        </button>
      </section>

      <section className="board" style={{ '--cols': `${COLS}` } as CSSProperties}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const content = cell.isRevealed
              ? cell.isMine
                ? '💣'
                : cell.adjacentMines > 0
                  ? String(cell.adjacentMines)
                  : ''
              : cell.isFlagged
                ? '🚩'
                : ''

            const classNames = [
              'cell',
              cell.isRevealed ? 'revealed' : 'hidden',
              cell.isMine && cell.isRevealed ? 'mine' : '',
              cell.isFlagged && !cell.isRevealed ? 'flagged' : '',
              cell.adjacentMines > 0 ? `num-${cell.adjacentMines}` : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={classNames}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(event) => handleContextMenu(event, rowIndex, colIndex)}
                aria-label={`第${rowIndex + 1}行第${colIndex + 1}列`}
              >
                {content}
              </button>
            )
          }),
        )}
      </section>
    </main>
  )
}

export default App
