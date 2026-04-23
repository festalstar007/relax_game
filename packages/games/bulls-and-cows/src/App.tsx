import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type GuessRecord = {
  id: number
  guess: string
  bulls: number
  cows: number
}

const DIGITS = '0123456789'
const ANSWER_LENGTH = 4

function createAnswer(): string {
  const pool = DIGITS.split('')
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

  const title = useMemo(() => (isWin ? '恭喜猜中！' : '开始推理，找出 4 位答案'), [isWin])

  const restart = () => {
    setAnswer(createAnswer())
    setGuess('')
    setRecords([])
    setError('')
    setIsWin(false)
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

    if (result.bulls === ANSWER_LENGTH) {
      setIsWin(true)
    }
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>猜数字（1A2B / Bulls and Cows）</h1>
        <p className="rules">规则：系统生成 4 位不重复数字（允许首位为 0）。A 表示数字和位置都正确，B 表示数字正确但位置错误。</p>
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
            aria-label="输入4位数字"
          />
          <button type="submit" disabled={isWin}>提交</button>
          <button type="button" className="secondary" onClick={restart}>重新开始</button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        {isWin ? (
          <p className="win">你用了 {records.length} 次猜中答案。</p>
        ) : (
          <p className="hint">提示：优先尝试不同数字组合，逐步锁定位置。</p>
        )}
      </section>

      <section className="panel history-panel">
        <h2>猜测记录</h2>
        {records.length === 0 ? (
          <p className="empty">还没有记录，先猜一次试试。</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>回合</th>
                <th>猜测</th>
                <th>反馈</th>
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
    </main>
  )
}
