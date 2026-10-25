import { useEffect, useRef } from 'react'
import { QUESTIONS } from '../data'
import { BackButton, Screen } from '../components/Screen'
import styles from './S3Question.module.css'

/** 선택 후 다음 문항으로 넘어가기까지 (AGENTS.md 10절) */
const ADVANCE_MS = 300
const LETTERS = 'ABCD'

interface Props {
  q: number
  answers: readonly (number | null)[]
  onAnswer: (value: number) => void
  onAdvance: () => void
  onBack: () => void
}

export function S3Question({ q, answers, onAnswer, onAdvance, onBack }: Props) {
  const question = QUESTIONS[q]
  const total = QUESTIONS.length
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  // 문항이 바뀌면 보조기기가 새 질문부터 읽도록 제목으로 포커스를 옮긴다
  useEffect(() => {
    clearTimeout(timer.current)
    heading.current?.focus({ preventScroll: true })
  }, [q])

  const choose = (i: number) => {
    onAnswer(i)
    clearTimeout(timer.current)
    timer.current = setTimeout(onAdvance, ADVANCE_MS)
  }

  const back = () => {
    clearTimeout(timer.current)
    onBack()
  }

  return (
    <Screen
      header={
        <>
          <BackButton onClick={back} />
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="질문 진행"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={q + 1}
            aria-valuetext={`${total}문항 중 ${q + 1}번째`}
          >
            <span style={{ width: `${((q + 1) / total) * 100}%` }} />
          </div>
          <span className={styles.count} aria-hidden="true">
            {q + 1}/{total}
          </span>
        </>
      }
      footer={
        <div className={styles.hint}>
          <img src="/mascot.png" alt="" width={64} height={64} />
          <p className={styles.bubble}>
            정답은 없어요!
            <br />
            지금의 나와 가장 가까운 걸 골라주세요
          </p>
        </div>
      }
    >
      <p className={styles.eyebrow}>
        Q{q + 1} · {question.axis}
      </p>
      <h1 className={styles.question} ref={heading} tabIndex={-1}>
        {question.q}
      </h1>
      <div className={styles.opts} role="group" aria-label={`Q${q + 1} 선택지`}>
        {question.opts.map((o, i) => {
          const on = answers[q] === i
          return (
            <button key={i} type="button" className={`${styles.opt} ${on ? styles.on : ''}`} aria-pressed={on} onClick={() => choose(i)}>
              <span className={styles.letter} aria-hidden="true">
                {LETTERS[i]}
              </span>
              <span>{o.text}</span>
            </button>
          )
        })}
      </div>
    </Screen>
  )
}
