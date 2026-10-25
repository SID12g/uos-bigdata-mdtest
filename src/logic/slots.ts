// 슬롯 공통 계산. course.ts와 partner.ts가 함께 쓴다.
import { MD_KEYS, OPEN_THIS_TERM, SLOTS, type MdKey, type Slot } from '../data'

/** ① 이번 학기 개설 ② 교내 개설 ③ 학점교류 */
export type Tier = 0 | 1 | 2

/** 고정 순서. 초급은 맨 뒤 (AGENTS.md 6-1) */
export const ORDER: readonly MdKey[] = ['머신러닝', '분석', '마이닝', '고급', '관리', '초급']

/** 학점교류 슬롯은 교과번호가 없어 `x:<slotId>`를 체크 키로 쓴다 */
export const exchangeKey = (slotId: string) => `x:${slotId}`
export const isExchangeKey = (code: string) => code.startsWith('x:')

export function slotCodes(s: Slot): string[] {
  if (s.exchange) return [exchangeKey(s.id)]
  return [s.main!, ...s.subs, ...s.old]
}

export function openCodes(s: Slot): string[] {
  return slotCodes(s).filter((c) => OPEN_THIS_TERM.has(c))
}

export function tierOf(s: Slot): Tier {
  if (openCodes(s).length) return 0
  return s.exchange ? 2 : 1
}

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s.id, i]))
export const SLOT_BY_ID: ReadonlyMap<string, Slot> = new Map(SLOTS.map((s) => [s.id, s]))
export const CODE_TO_SLOT: ReadonlyMap<string, string> = new Map(
  SLOTS.flatMap((s) => slotCodes(s).map((c) => [c, s.id] as const)),
)

/** 같은 순위 안에서는 공유 MD 수가 많은 슬롯 먼저 */
export function recSort(a: Slot, b: Slot): number {
  return tierOf(a) - tierOf(b) || b.md.length - a.md.length || SLOT_INDEX.get(a.id)! - SLOT_INDEX.get(b.id)!
}

export function takenSlots(checked: Iterable<string>): Set<string> {
  const taken = new Set<string>()
  for (const c of checked) {
    const id = CODE_TO_SLOT.get(c)
    if (id) taken.add(id)
  }
  return taken
}

export const slotsOf = (md: MdKey) => SLOTS.filter((s) => s.md.includes(md))
export const countFor = (md: MdKey, taken: ReadonlySet<string>) => slotsOf(md).filter((s) => taken.has(s.id)).length

export function progressOf(taken: ReadonlySet<string>): Record<MdKey, number> {
  return Object.fromEntries(MD_KEYS.map((t) => [t, Math.min(countFor(t, taken), 4)])) as Record<MdKey, number>
}
