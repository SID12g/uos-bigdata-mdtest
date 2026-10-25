// 학기·과목 데이터에 타입을 붙여 내보낸다. 값은 전부 JSON에 있고 여기서는 모양만 정한다.
import termJson from './term.json'
import coursesJson from './courses.json'
import slotsJson from './slots.json'
import linkedJson from './linked.json'
import bigMajorJson from './bigMajor.json'
import questionsJson from './questions.json'
import typesJson from './types.json'

export const MD_KEYS = ['초급', '관리', '분석', '머신러닝', '마이닝', '고급'] as const
export type MdKey = (typeof MD_KEYS)[number]

export type SlotGroup = 'basic' | 'mid' | 'ai' | 'x'

export interface Slot {
  id: string
  name: string
  /** 본 과목 교과번호. 학점교류 슬롯은 없다 */
  main?: string
  /** 대체 과목 */
  subs: string[]
  /** 구 교과번호 */
  old: string[]
  md: MdKey[]
  group: SlotGroup
  exchange: boolean
  subsOpen: boolean
}

export interface Course {
  name: string
  dept: string
}

export interface LinkedMd {
  md: string
  courses: string[]
  /** 구 번호 → 새 번호 */
  old?: Record<string, string>
}

export interface Question {
  axis: string
  q: string
  opts: { text: string; add?: Partial<Record<MdKey, number>> }[]
}

export interface MdType {
  /** public/ 기준 결과 이미지 경로 */
  image: string
  full: string
  persona: string
  line: string
  tags: string[]
  /** 대표 4과목 (슬롯 id) */
  rep: string[]
}

export const TERM: string = termJson.termLabel
export const OPEN_THIS_TERM: ReadonlySet<string> = new Set(termJson.openThisTerm)

export const COURSES: Readonly<Record<string, Course>> = coursesJson

// PLAN-확인필요: p.12 초급 대체과목 '빅데이터개론1 (02098)' — 01919로 보이지만 초급 슬롯에서 제외
export const SLOTS: readonly Slot[] = (slotsJson as Array<Partial<Slot> & Pick<Slot, 'id' | 'name' | 'md' | 'group'>>).map((s) => ({
  ...s,
  subs: s.subs ?? [],
  old: s.old ?? [],
  exchange: s.exchange ?? false,
  subsOpen: s.subsOpen ?? false,
}))

export const SLOT_GROUPS: readonly { id: Exclude<SlotGroup, 'x'>; name: string }[] = [
  { id: 'basic', name: '기초 · 통계·프로그래밍' },
  { id: 'mid', name: '데이터 관리·분석' },
  { id: 'ai', name: 'AI · 고급' },
]

// PLAN-확인필요: p.20 교통빅데이터 개설 학과 표기(영어영문학과) — 교통공학과로 둠
// PLAN-확인필요: p.20 각주 구 과목 '교통빅데이터분석 (41832)' — 구 번호를 41948로 매핑
// PLAN-확인필요: p.8 / p.19 '빅데이터인구경제학' vs '데이터인구경제학' — 빅데이터인구경제학
export const LINKED: Readonly<Record<string, LinkedMd[]>> = linkedJson.depts
export const DEPTS: readonly string[] = Object.keys(linkedJson.depts)
export const LINKED_REQUIRED = linkedJson.required

// PLAN-확인필요: p.21 구 번호 47783(빅데이터와통계읽기) — 47818과 같은 과목으로 취급
export const BIG_MAJOR: ReadonlySet<string> = new Set(bigMajorJson)

export const QUESTIONS = questionsJson as Question[]
export const TYPES = typesJson as Record<MdKey, MdType>
