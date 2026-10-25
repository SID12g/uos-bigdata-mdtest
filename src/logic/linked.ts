import { BIG_MAJOR, LINKED, LINKED_REQUIRED, type LinkedMd } from '../data'

export interface LinkedProgress extends LinkedMd {
  /** 빅데이터개론 충족 */
  req: boolean
  /** 들은 지정 과목 (새 번호 기준) */
  designated: string[]
  /** 빅데이터전공 교과목으로 인정된 첫 과목 */
  major: string | null
  /** 0–4 */
  n: number
}

export function linkedProgress(dept: string | null | undefined, checked: ReadonlySet<string>): LinkedProgress[] {
  const list = dept ? LINKED[dept] : undefined
  if (!list) return []
  const req = LINKED_REQUIRED.codes.some((c) => checked.has(c))
  const major = [...checked].find((c) => BIG_MAJOR.has(c)) ?? null
  return list.map((l) => {
    const oldOf = Object.entries(l.old ?? {})
    const designated = l.courses.filter((c) => checked.has(c) || oldOf.some(([o, n]) => n === c && checked.has(o)))
    const n = (req ? 1 : 0) + Math.min(designated.length, 2) + (major ? 1 : 0)
    return { ...l, req, designated, major, n }
  })
}
