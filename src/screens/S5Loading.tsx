import { useEffect } from 'react'
import type { Mode } from '../state/state'
import { Screen } from '../components/Screen'
import ui from '../components/ui.module.css'
import styles from './S5Loading.module.css'

/** 결과 화면으로 넘어가기 전 연출 시간 (AGENTS.md 10절) */
const LOADING_MS = 1500

export function S5Loading({ mode, checkedCount, onDone }: { mode: Mode; checkedCount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, LOADING_MS)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <Screen bodyClassName={styles.body}>
      <div className={styles.load} role="status" aria-live="polite">
        <div className={`${ui.orbit} ${styles.orbit}`}>
          <img src="/mascot.png" alt="" width={200} height={200} />
        </div>
        <p className={styles.title}>
          나에게 맞는 MD를
          <br />
          찾고 있어요
        </p>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <p className={styles.what}>
          {mode === 'course' ? `체크한 과목 ${checkedCount}개를 MD 6종에 맞춰보는 중` : '응답에서 준비도와 관심 방향을 계산하는 중'}
        </p>
      </div>
    </Screen>
  )
}
