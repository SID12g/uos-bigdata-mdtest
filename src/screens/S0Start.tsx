import type { CSSProperties } from 'react'
import { TYPES, type MdKey } from '../data'
import { Screen } from '../components/Screen'
import ui from '../components/ui.module.css'
import styles from './S0Start.module.css'

// Figma S0(node 10:757) 기준 칩 위치. 362×280 영역 왼쪽 위 기준. 바꾸지 않는다
const CHIPS: { md: MdKey; pos: CSSProperties }[] = [
  { md: '초급', pos: { left: 27, top: 29 } },
  { md: '관리', pos: { left: 227, top: 21 } },
  { md: '분석', pos: { left: 0, top: 132 } },
  { md: '머신러닝', pos: { left: 291, top: 120 } },
  { md: '마이닝', pos: { left: 33, top: 223 } },
  { md: '고급', pos: { left: 219, top: 240 } },
]

export function S0Start({ onStart }: { onStart: () => void }) {
  return (
    <Screen
      bodyClassName={styles.body}
      footerClassName={styles.footer}
      footer={
        <>
          <button type="button" className={ui.cta} onClick={onStart}>
            테스트 시작하기
          </button>
          <p className={styles.copy}>© 서울시립대학교 빅데이터혁신융합대학사업단</p>
        </>
      }
    >
      <span className={styles.pill}>빅데이터 표준 마이크로디그리 유형 테스트</span>
      <h1 className={styles.heading}>
        <span>나에게 꼭 맞는</span>
        <em>마이크로디그리는?</em>
      </h1>
      <p className={styles.sub}>
        간단한 질문에 답하고
        <br />
        나의 빅데이터 성향과 추천 MD를 알아보세요
      </p>
      <div className={styles.group}>
        <div className={`${ui.orbit} ${styles.orbit}`}>
          <img src="/mascot.png" alt="" width={200} height={200} />
        </div>
        <ul className={styles.chips} aria-label="표준 MD 6종">
          {CHIPS.map(({ md, pos }) => (
            <li key={md} className={styles.chip} style={pos}>
              {TYPES[md].full}
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  )
}
