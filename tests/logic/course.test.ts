import { describe, expect, it } from 'vitest'
import { COURSES, MD_KEYS, SLOTS } from '../../src/data'
import { courseResult } from '../../src/logic/course'
import { jointNeed } from '../../src/logic/partner'
import { progressOf, slotCodes, takenSlots } from '../../src/logic/slots'

describe('과목 기반 사례: 교통공학과', () => {
  const checked = new Set(['41510', '92005', '47770', '47772', '64223', '41518'])
  const r = courseResult(checked, '교통공학과')

  it('진행률', () => {
    expect(r.prog).toEqual({ 초급: 2, 관리: 1, 분석: 3, 머신러닝: 3, 마이닝: 0, 고급: 0 })
  })

  it('추천은 머신러닝 (분석과 동점, 남은 개설 슬롯 2 vs 1)', () => {
    expect(r.main).toBe('머신러닝')
    expect(r.tie).toEqual(['분석', '머신러닝'])
  })

  it('남은 과목 추천: 다변량통계학', () => {
    expect(r.recs.map((s) => s.name)).toEqual(['다변량통계학'])
  })

  it('함께 따기: 분석, 1과목(딥러닝)', () => {
    expect(r.partner?.md).toBe('분석')
    expect(r.partner?.k).toBe(1)
    expect(r.partner?.slots.map((s) => s.name)).toEqual(['딥러닝'])
  })

  it('연계융합 교통빅데이터 2/4', () => {
    expect(r.linked).toHaveLength(1)
    const l = r.linked[0]
    expect(l.md).toBe('교통빅데이터')
    expect(l.req).toBe(false)
    expect(Math.min(l.designated.length, 2)).toBe(1)
    expect(l.major).not.toBeNull()
    expect(l.n).toBe(2)
  })
})

describe('들은 과목 0개에서 두 MD를 함께 따는 최소 과목 수', () => {
  const none = new Set<string>()
  it.each([
    ['분석', '머신러닝', 4],
    ['관리', '분석', 5],
    ['마이닝', '고급', 5],
  ] as const)('%s + %s: %i', (a, b, k) => {
    expect(jointNeed(a, b, none)?.k).toBe(k)
  })

  it('초급 + 다른 MD: 8', () => {
    for (const t of MD_KEYS.filter((x) => x !== '초급')) expect(jointNeed('초급', t, none)?.k).toBe(8)
  })
})

describe('경계 사례', () => {
  it('같은 슬롯 과목 두 개는 1개로 센다', () => {
    const taken = takenSlots(['28012', '27003'])
    expect(taken).toEqual(new Set(['stat']))
    expect(progressOf(taken).초급).toBe(1)
  })

  it('01919만 고르면 어떤 MD도 진행되지 않는다', () => {
    const r = courseResult(new Set(['01919']), null)
    expect(Object.values(r.prog).every((n) => n === 0)).toBe(true)
  })

  it('모든 교과번호를 고르면 6개 MD 모두 4/4, 함께 따기 없음', () => {
    const all = new Set([...Object.keys(COURSES), ...SLOTS.flatMap(slotCodes)])
    const r = courseResult(all, null)
    expect(r.done).toEqual([...MD_KEYS])
    expect(r.partner).toBeNull()
    expect(r.recs).toEqual([])
  })

  it('모든 MD가 1/4 이하면 weak', () => {
    expect(courseResult(new Set(['47002']), null).weak).toBe(true)
  })

  it('학과를 고르지 않으면 연계융합 없음', () => {
    expect(courseResult(new Set(['47002']), null).linked).toEqual([])
  })

  it('경제학부는 연계융합 2개', () => {
    expect(courseResult(new Set(['02098', '28015', '28137']), '경제학부').linked.map((l) => l.n)).toEqual([3, 1])
  })

  it('지정 과목의 구 번호는 새 번호로 인정', () => {
    const [l] = courseResult(new Set(['41948']), '교통공학과').linked
    expect(l.designated).toEqual(['46114'])
  })

  it('구 번호 01914는 개론 필수로 인정, 01919는 불인정', () => {
    expect(courseResult(new Set(['01914']), '수학과').linked[0].req).toBe(true)
    expect(courseResult(new Set(['01919']), '수학과').linked[0].req).toBe(false)
  })
})
