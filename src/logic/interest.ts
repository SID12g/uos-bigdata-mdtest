import { QUESTIONS, TYPES, type MdKey } from '../data'
import { ORDER } from './slots'
import { bestPartner, type Partner } from './partner'

export type Answers = readonly (number | null)[]
export type Stage = '입문' | '성장' | '심화'
export type InterestKey = Exclude<MdKey, '초급'>

export const INTEREST: readonly InterestKey[] = ['관리', '분석', '머신러닝', '마이닝', '고급']
/** Q8 A–D가 가리키는 유형 */
export const CAREER: readonly InterestKey[] = ['분석', '머신러닝', '마이닝', '관리']
/** Q5 A–D가 가리키는 유형 */
export const ROLE: readonly InterestKey[] = ['관리', '분석', '머신러닝', '고급']

const Q5 = 4
const Q8 = 7

export function readiness(ans: Answers): number {
  return (ans[0] ?? 0) + (ans[1] ?? 0)
}

export function stageOf(ready: number): Stage {
  return ready <= 1 ? '입문' : ready <= 4 ? '성장' : '심화'
}

/** Q3–Q8 가산점 합계 (심화 보너스 제외) */
export function interestScores(ans: Answers): Record<InterestKey, number> {
  const s = Object.fromEntries(INTEREST.map((t) => [t, 0])) as Record<InterestKey, number>
  for (let q = 2; q < QUESTIONS.length; q++) {
    const a = ans[q]
    if (a == null) continue
    const add = QUESTIONS[q].opts[a].add ?? {}
    for (const [k, v] of Object.entries(add)) s[k as InterestKey] += v
  }
  return s
}

export interface InterestResult {
  mode: 'interest'
  main: MdKey
  /** 입문 단계일 때의 다음 목표 */
  next: InterestKey | null
  top: InterestKey
  ready: number
  stage: Stage
  /** 심화 보너스 포함 */
  scores: Record<InterestKey, number>
  best: number
  tie: InterestKey[] | null
  how: 'single' | 'Q8' | 'Q5' | 'order'
}

export function interestResult(ans: Answers): InterestResult {
  const ready = readiness(ans)
  const stage = stageOf(ready)
  const scores = interestScores(ans)
  if (stage === '심화') scores.고급 += 2
  const best = Math.max(...INTEREST.map((t) => scores[t]))
  const top = ORDER.filter((t): t is InterestKey => t !== '초급' && scores[t as InterestKey] === best)
  let pick = top[0]
  let how: InterestResult['how'] = 'single'
  if (top.length > 1) {
    const career = ans[Q8] != null ? CAREER[ans[Q8]!] : undefined
    const role = ans[Q5] != null ? ROLE[ans[Q5]!] : undefined
    if (career && top.includes(career)) {
      pick = career
      how = 'Q8'
    } else if (role && top.includes(role)) {
      pick = role
      how = 'Q5'
    } else {
      how = 'order'
    }
  }
  const intro = stage === '입문'
  return {
    mode: 'interest',
    main: intro ? '초급' : pick,
    next: intro ? pick : null,
    top: pick,
    ready,
    stage,
    scores,
    best,
    tie: top.length > 1 ? top : null,
    how,
  }
}

/** 흥미 결과의 함께 따기: 주 MD의 대표 4과목을 들었다고 가정 (AGENTS.md 6-3) */
export function interestPartner(main: MdKey): Partner | null {
  if (main === '초급') return null
  return bestPartner(main, new Set(TYPES[main].rep))
}
