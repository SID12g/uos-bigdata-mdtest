import { SLOTS, type MdKey, type Slot } from '../data'
import { ORDER, countFor, recSort, tierOf } from './slots'

export interface Partner {
  md: MdKey
  /** 지금부터 더 들어야 하는 과목 수 */
  k: number
  /** 주 MD만 채울 때 필요한 과목 수 */
  needA: number
  needB: number
  slots: Slot[]
}

function* combos<T>(arr: readonly T[], k: number, start = 0, acc: T[] = []): Generator<T[]> {
  if (acc.length === k) {
    yield acc
    return
  }
  for (let i = start; i <= arr.length - (k - acc.length); i++) yield* combos(arr, k, i + 1, [...acc, arr[i]])
}

/** 두 MD를 모두 4/4로 만드는 최소 추가 과목 조합 (교내 슬롯만) */
export function jointNeed(a: MdKey, b: MdKey, taken: ReadonlySet<string>): Omit<Partner, 'md'> | null {
  const needA = Math.max(0, 4 - countFor(a, taken))
  const needB = Math.max(0, 4 - countFor(b, taken))
  const cand = SLOTS.filter((s) => !s.exchange && !taken.has(s.id) && (s.md.includes(a) || s.md.includes(b))).sort(recSort)
  for (let k = Math.max(needA, needB); k <= cand.length; k++) {
    let best: Slot[] | null = null
    let bestScore = -1
    for (const c of combos(cand, k)) {
      if (c.filter((s) => s.md.includes(a)).length < needA) continue
      if (c.filter((s) => s.md.includes(b)).length < needB) continue
      const score = c.filter((s) => tierOf(s) === 0).length * 10 + c.reduce((n, s) => n + s.md.length, 0)
      if (score > bestScore) {
        best = c
        bestScore = score
      }
    }
    if (best) return { k, needA, needB, slots: [...best].sort(recSort) }
  }
  return null
}

/** k가 가장 작은 짝 MD. 초급과 이미 4/4인 MD는 후보에서 뺀다 */
export function bestPartner(main: MdKey, taken: ReadonlySet<string>): Partner | null {
  let best: Partner | null = null
  for (const p of ORDER) {
    if (p === main || p === '초급' || countFor(p, taken) >= 4) continue
    const j = jointNeed(main, p, taken)
    if (j && (!best || j.k < best.k)) best = { md: p, ...j }
  }
  return best
}
