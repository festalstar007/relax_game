import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type GuessRecord = {
  id: number
  guess: string
  bulls: number
  cows: number
}

type DigitStatus = 'possible' | 'excluded' | 'confirmed'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const ANSWER_LENGTH = 4

function createAnswer(): string {
  const pool = [...DIGITS]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, ANSWER_LENGTH).join('')
}

function evaluateGuess(answer: string, guess: string) {
  let bulls = 0
  let cows = 0

  for (let i = 0; i < ANSWER_LENGTH; i += 1) {
    if (guess[i] === answer[i]) {
      bulls += 1
    } else if (answer.includes(guess[i])) {
      cows += 1
    }
  }

  return { bulls, cows }
}

function isValidGuess(value: string) {
  if (!/^\d{4}$/.test(value)) {
    return '请输入4位数字。'
  }

  if (new Set(value).size !== ANSWER_LENGTH) {
    return '4位数字不能重复。'
  }

  return ''
}

export default function App() {
  const [answer, setAnswer] = useState(() => createAnswer())
  const [guess, setGuess] = useState('')
  const [records, setRecords] = useState<GuessRecord[]>([])
  const [error, setError] = useState('')
  const [isWin, setIsWin] = useState(false)

  // 辅助推理矩阵：matrix[position][digitIndex]
  const [matrix, setMatrix] = useState<DigitStatus[][]>(() =>
    Array.from({ length: ANSWER_LENGTH }, () => Array.from({ length: 10 }, () => 'possible')),
  )

  const title = useMemo(() => (isWin ? '恭喜猜中！' : '开始推理，找出 4 位答案'), [isWin])

  const restart = () => {
    setAnswer(createAnswer())
    setGuess('')
    setRecords([])
    setError('')
    setIsWin(false)
    setMatrix(Array.from({ length: ANSWER_LENGTH }, () => Array.from({ length: 10 }, () => 'possible')))
  }

  const toggleDigit = (pos: number, dIdx: number) => {
    setMatrix((prev) => {
      const next = prev.map((row) => [...row])
      const current = next[pos][dIdx]
      if (current === 'possible') next[pos][dIdx] = 'excluded'
      else if (current === 'excluded') next[pos][dIdx] = 'confirmed'
      else next[pos][dIdx] = 'possible'
      return next
    })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isWin) {
      return
    }

    const trimmed = guess.trim()
    const validationError = isValidGuess(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }

    const result = evaluateGuess(answer, trimmed)
    const nextRecord: GuessRecord = {
      id: records.length + 1,
      guess: trimmed,
      bulls: result.bulls,
      cows: result.cows,
    }

    setRecords((prev) => [nextRecord, ...prev])
    setGuess('')
    setError('')

    // 自动推理
    setMatrix((prev) => {
      const next = prev.map((row) => [...row])
      const guessDigits = [...trimmed]

      // 情况 1: 0A 0B (全不中)
      if (result.bulls === 0 && result.cows === 0) {
        guessDigits.forEach((digit) => {
          const dIdx = parseInt(digit)
          for (let p = 0; p < ANSWER_LENGTH; p++) {
            if (next[p][dIdx] === 'possible') next[p][dIdx] = 'excluded'
          }
        })
      }
      // 情况 2: 0A (位置全不对)
      else if (result.bulls === 0) {
        guessDigits.forEach((digit, p) => {
          const dIdx = parseInt(digit)
          if (next[p][dIdx] === 'possible') next[p][dIdx] = 'excluded'
        })
      }

      return next
    })

    if (result.bulls === ANSWER_LENGTH) {
      setIsWin(true)
    }
  }

  return (
    <main className="container">
      <div className="game-layout">
        <div className="left-column">
          <section className="panel">
            <h1>猜数字 (1A2B)</h1>
            <p className="rules">系统生成 4 位不重复数字。A:位置对，B:数字对位置错。</p>
            <p className="status">{title}</p>

            <form className="guess-form" onSubmit={onSubmit}>
              <input
                value={guess}
                onChange={(event) => {
                  const next = event.target.value.replace(/\D/g, '').slice(0, ANSWER_LENGTH)
                  setGuess(next)
                }}
                placeholder="例如：0284"
                inputMode="numeric"
                autoComplete="off"
              />
              <div className="form-buttons">
                <button type="submit" disabled={isWin}>提交</button>
                <button type="button" className="secondary" onClick={restart}>重置</button>
              </div>
            </form>

            {error ? <p className="error">{error}</p> : null}
            {isWin ? <p className="win">挑战成功！用时 {records.length} 次</p> : null}
          </section>

          <section className="panel helper-panel">
            <h2>辅助推理</h2>
            <p className="helper-hint">点击数字：蓝(可能) → 灰(排除) → 绿(确认)</p>
            <div className="matrix">
              {matrix.map((row, pIdx) => (
                <div key={pIdx} className="matrix-row">
                  <span className="pos-label">位{pIdx + 1}</span>
                  <div className="digit-grid">
                    {row.map((status, dIdx) => (
                      <button
                        key={dIdx}
                        type="button"
                        className={`digit-btn ${status}`}
                        onClick={() => toggleDigit(pIdx, dIdx)}
                      >
                        {dIdx}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="panel history-panel">
          <h2>猜测记录</h2>
          {records.length === 0 ? (
            <p className="empty">无记录</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>猜测</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td className="guess-value">{record.guess}</td>
                    <td>{record.bulls}A{record.cows}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}
