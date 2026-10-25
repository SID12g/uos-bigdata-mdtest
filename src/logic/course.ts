import { MD_KEYS, type MdKey, type Slot } from '../data'
import { bestPartner, type Partner } from './partner'
import { linkedProgress, type LinkedProgress } from './linked'
import { ORDER, countFor, progressOf, recSort, slotsOf, takenSlots, tierOf } from './slots'

/** 남은 슬롯을 개설 순위대로 정렬해 부족한 개수만큼 추천 */
export function remainingFor(md: MdKey, taken: ReadonlySet<string>): Slot[] {
  const need = Math.max(0, 4 - countFor(md, taken))
  return slotsOf(md)
    .filter((s) => !taken.has(s.id))
    .sort(recSort)
    .slice(0, need)
}

function openLeft(md: MdKey, taken: ReadonlySet<string>): number {
  return slotsOf(md).filter((s) => !taken.has(s.id) && tierOf(s) === 0).length
}

export interface CourseResult {
  mode: 'course'
  main: MdKey
  prog: Record<MdKey, number>
  /** 진행률 순위 (동점 규칙 적용) */
  ranked: MdKey[]
  tie: MdKey[] | null
  done: MdKey[]
  taken: Set<string>
  recs: Slot[]
  partner: Partner | null
  linked: LinkedProgress[]
  /** 모든 MD가 1/4 이하 */
  weak: boolean
}

export function courseResult(checked: ReadonlySet<string>, dept: string | null | undefined): CourseResult {
  const taken = takenSlots(checked)
  const prog = progressOf(taken)
  const ranked = [...MD_KEYS].sort(
    (a, b) => prog[b] - prog[a] || openLeft(b, taken) - openLeft(a, taken) || ORDER.indexOf(a) - ORDER.indexOf(b),
  )
  const main = ranked[0]
  const tie = MD_KEYS.filter((t) => prog[t] === prog[main])
  return {
    mode: 'course',
    main,
    prog,
    ranked,
    tie: tie.length > 1 ? tie : null,
    done: MD_KEYS.filter((t) => prog[t] === 4),
    taken,
    recs: remainingFor(main, taken),
    partner: bestPartner(main, taken),
    linked: linkedProgress(dept, checked),
    weak: prog[main] <= 1,
  }
}
