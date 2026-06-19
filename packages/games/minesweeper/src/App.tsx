import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type TouchEvent,
} from 'react'
import './App.css'

type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

type InputMode = 'reveal' | 'flag'

type DifficultyKey = 'beginner' | 'intermediate' | 'advanced'

interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
  label: string
}

const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10, label: '初级' },
  intermediate: { rows: 16, cols: 16, mines: 40, label: '中级' },
  advanced: { rows: 16, cols: 30, mines: 99, label: '高级' },
}

const LONG_PRESS_MS = 350
const TOUCH_MOVE_THRESHOLD = 10

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

function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
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

function inBounds(row: number, col: number, rows: number, cols: number): boolean {
  return row >= 0 && row < rows && col >= 0 && col < cols
}

function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number,
): Array<[number, number]> {
  return OFFSETS.map(([dr, dc]) => [row + dr, col + dc] as [number, number]).filter(
    ([nextRow, nextCol]) => inBounds(nextRow, nextCol, rows, cols),
  )
}

function placeMines(
  board: Cell[][],
  safeRow: number,
  safeCol: number,
  rows: number,
  cols: number,
  mineCount: number,
): void {
  const protectedCells = new Set<string>([`${safeRow},${safeCol}`])

  for (const [row, col] of getNeighbors(safeRow, safeCol, rows, cols)) {
    protectedCells.add(`${row},${col}`)
  }

  const candidates: Array<[number, number]> = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!protectedCells.has(`${row},${col}`)) {
        candidates.push([row, col])
      }
    }
  }

  const mineLimit = Math.min(mineCount, candidates.length)
  for (let i = 0; i < mineLimit; i += 1) {
    const randomIndex = Math.floor(Math.random() * candidates.length)
    const [row, col] = candidates.splice(randomIndex, 1)[0]
    board[row][col].isMine = true
  }
}

function calculateAdjacentMines(board: Cell[][], rows: number, cols: number): void {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (board[row][col].isMine) {
        continue
      }

      let count = 0
      for (const [nextRow, nextCol] of getNeighbors(row, col, rows, cols)) {
        if (board[nextRow][nextCol].isMine) {
          count += 1
        }
      }
      board[row][col].adjacentMines = count
    }
  }
}

function buildBoard(
  rows: number,
  cols: number,
  mineCount: number,
  safeRow: number,
  safeCol: number,
): Cell[][] {
  const board = createEmptyBoard(rows, cols)
  placeMines(board, safeRow, safeCol, rows, cols, mineCount)
  calculateAdjacentMines(board, rows, cols)
  return board
}

function revealConnectedCells(
  board: Cell[][],
  startRow: number,
  startCol: number,
  rows: number,
  cols: number,
): void {
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

    for (const [nextRow, nextCol] of getNeighbors(row, col, rows, cols)) {
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

function chordReveal(
  board: Cell[][],
  row: number,
  col: number,
  rows: number,
  cols: number,
): 'safe' | 'mine' {
  const centerCell = board[row][col]
  if (!centerCell.isRevealed || centerCell.adjacentMines <= 0) {
    return 'safe'
  }

  const neighbors = getNeighbors(row, col, rows, cols)
  const flaggedCount = neighbors.reduce((count, [nextRow, nextCol]) => {
    return count + (board[nextRow][nextCol].isFlagged ? 1 : 0)
  }, 0)

  if (flaggedCount !== centerCell.adjacentMines) {
    return 'safe'
  }

  for (const [nextRow, nextCol] of neighbors) {
    const neighborCell = board[nextRow][nextCol]
    if (neighborCell.isFlagged || neighborCell.isRevealed) {
      continue
    }

    if (neighborCell.isMine) {
      neighborCell.isRevealed = true
      return 'mine'
    }

    revealConnectedCells(board, nextRow, nextCol, rows, cols)
  }

  return 'safe'
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
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>('beginner')
  const { rows, cols, mines: mineCount } = DIFFICULTIES[difficultyKey]

  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard(rows, cols))
  const [status, setStatus] = useState<GameStatus>('ready')
  const [seconds, setSeconds] = useState(0)
  const [inputMode, setInputMode] = useState<InputMode>('reveal')
  const [longPressEnabled, setLongPressEnabled] = useState(true)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  const longPressTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressNextClickRef = useRef(false)

  const minesLeft = useMemo(() => mineCount - countFlags(board), [board, mineCount])

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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const handleChange = (): void => {
      setIsCoarsePointer(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  function clearLongPress(): void {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartRef.current = null
  }

  function restartGame(newDifficulty?: DifficultyKey): void {
    clearLongPress()
    const targetDifficulty = newDifficulty || difficultyKey
    const { rows: r, cols: c } = DIFFICULTIES[targetDifficulty]

    if (newDifficulty) {
      setDifficultyKey(newDifficulty)
    }

    setBoard(createEmptyBoard(r, c))
    setStatus('ready')
    setSeconds(0)
    setInputMode('reveal')
  }

  function revealCell(row: number, col: number): void {
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
      nextBoard = buildBoard(rows, cols, mineCount, row, col)
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

    revealConnectedCells(nextBoard, row, col, rows, cols)

    if (hasWon(nextBoard)) {
      revealAllMines(nextBoard)
      setStatus('won')
      setTimeout(() => {
        alert('恭喜你，挑战成功！')
      }, 100)
    } else {
      setStatus(nextStatus)
    }

    setBoard(nextBoard)
  }

  function toggleFlag(row: number, col: number): void {
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

  function performAction(row: number, col: number, actionMode: InputMode): void {
    if (actionMode === 'flag') {
      toggleFlag(row, col)
      return
    }
    revealCell(row, col)
  }

  function handleCellClick(row: number, col: number): void {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }
    performAction(row, col, isCoarsePointer ? inputMode : 'reveal')
  }

  function handleContextMenu(event: MouseEvent<HTMLButtonElement>, row: number, col: number): void {
    event.preventDefault()

    const cell = board[row][col]
    if (cell.isRevealed) {
      if (status === 'won' || status === 'lost') {
        return
      }

      const nextBoard = cloneBoard(board)
      const revealResult = chordReveal(nextBoard, row, col, rows, cols)

      if (revealResult === 'mine') {
        revealAllMines(nextBoard)
        setBoard(nextBoard)
        setStatus('lost')
        return
      }

      if (hasWon(nextBoard)) {
        revealAllMines(nextBoard)
        setBoard(nextBoard)
        setStatus('won')
        return
      }

      setBoard(nextBoard)
      return
    }

    toggleFlag(row, col)
  }

  function handleTouchStart(event: TouchEvent<HTMLButtonElement>, row: number, col: number): void {
    if (!isCoarsePointer || status === 'won' || status === 'lost' || !longPressEnabled) {
      return
    }

    const touch = event.touches[0]

    clearLongPress()
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    longPressTimerRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = true
      toggleFlag(row, col)
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
      clearLongPress()
    }, LONG_PRESS_MS)
  }

  function handleTouchMove(event: TouchEvent<HTMLButtonElement>): void {
    if (!isCoarsePointer || !longPressEnabled || !touchStartRef.current) {
      return
    }

    const touch = event.touches[0]
    const dx = Math.abs(touch.clientX - touchStartRef.current.x)
    const dy = Math.abs(touch.clientY - touchStartRef.current.y)
    if (dx > TOUCH_MOVE_THRESHOLD || dy > TOUCH_MOVE_THRESHOLD) {
      clearLongPress()
    }
  }

  function handleTouchEnd(): void {
    clearLongPress()
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>扫雷小游戏</h1>
        <div className="difficulty-selector">
          {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`difficulty-button ${difficultyKey === key ? 'active' : ''}`}
              onClick={() => restartGame(key)}
            >
              {DIFFICULTIES[key].label}
            </button>
          ))}
        </div>
        <p className="hint">
          {isCoarsePointer ? '点击按当前模式操作，支持长按插旗，首击安全。' : '左键开格，右键插旗，首击安全。'}
        </p>
        <div className="status-row">
          <span>状态：{statusText(status)}</span>
          <span>剩余雷数：{minesLeft}</span>
          <span>用时：{seconds}s</span>
        </div>
        {isCoarsePointer ? (
          <div className="mobile-controls">
            <button
              type="button"
              className="mode-button"
              onClick={() => setInputMode((current) => (current === 'reveal' ? 'flag' : 'reveal'))}
            >
              当前模式：{inputMode === 'reveal' ? '开格' : '插旗'}
            </button>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={longPressEnabled}
                onChange={(event) => setLongPressEnabled(event.target.checked)}
              />
              长按插旗
            </label>
          </div>
        ) : null}
        <button type="button" className="restart-button" onClick={() => restartGame()}>
          重新开始
        </button>
      </section>

      <section className="board" style={{ '--cols': `${cols}` } as CSSProperties}>
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
                onTouchStart={(event) => handleTouchStart(event, rowIndex, colIndex)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
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
