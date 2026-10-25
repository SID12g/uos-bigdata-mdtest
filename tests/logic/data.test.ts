import { describe, expect, it } from 'vitest'
import { BIG_MAJOR, COURSES, LINKED, LINKED_REQUIRED, OPEN_THIS_TERM, QUESTIONS, SLOTS, TYPES, MD_KEYS } from '../../src/data'
import { SLOT_BY_ID, slotCodes, tierOf } from '../../src/logic/slots'

describe('데이터 규모', () => {
  it('슬롯 26개, 교내 20개, 2026-2 개설 12개', () => {
    expect(SLOTS).toHaveLength(26)
    expect(SLOTS.filter((s) => !s.exchange)).toHaveLength(20)
    expect(SLOTS.filter((s) => tierOf(s) === 0)).toHaveLength(12)
  })

  it('문항 8개, 선택지 4개씩', () => {
    expect(QUESTIONS).toHaveLength(8)
    QUESTIONS.forEach((q) => expect(q.opts).toHaveLength(4))
  })

  it('연계융합 학과 14개, MD 16개', () => {
    expect(Object.keys(LINKED)).toHaveLength(14)
    expect(Object.values(LINKED).flat()).toHaveLength(16)
  })
})

describe('데이터 무결성', () => {
  it('슬롯의 모든 교과번호가 courses.json에 있다', () => {
    for (const s of SLOTS.filter((x) => !x.exchange)) {
      for (const c of slotCodes(s)) expect(COURSES[c], `${s.id} ${c}`).toBeDefined()
    }
  })

  it('한 교과번호는 슬롯 하나에만 속한다', () => {
    const codes = SLOTS.flatMap(slotCodes)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('연계융합 지정 과목·구 번호·필수 과목이 courses.json에 있다', () => {
    for (const l of Object.values(LINKED).flat()) {
      for (const c of [...l.courses, ...Object.keys(l.old ?? {})]) expect(COURSES[c], `${l.md} ${c}`).toBeDefined()
      for (const n of Object.values(l.old ?? {})) expect(l.courses).toContain(n)
    }
    for (const c of LINKED_REQUIRED.codes) expect(COURSES[c]).toBeDefined()
  })

  it('openThisTerm과 빅데이터전공 후보가 모두 존재한다', () => {
    for (const c of OPEN_THIS_TERM) expect(COURSES[c], c).toBeDefined()
    for (const c of BIG_MAJOR) expect(COURSES[c], c).toBeDefined()
  })

  it('빅데이터개론1 01919는 어떤 슬롯에도 없다', () => {
    expect(SLOTS.flatMap(slotCodes)).not.toContain('01919')
  })

  it('대표 4과목은 해당 MD의 슬롯이다', () => {
    for (const t of MD_KEYS) {
      expect(TYPES[t].rep).toHaveLength(4)
      for (const id of TYPES[t].rep) expect(SLOT_BY_ID.get(id)?.md).toContain(t)
    }
  })
})
