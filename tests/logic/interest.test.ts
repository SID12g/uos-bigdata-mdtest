import { describe, expect, it } from 'vitest'
import { MD_KEYS, type MdKey } from '../../src/data'
import { interestPartner, interestResult } from '../../src/logic/interest'

describe('흥미 기반 전수 검사 (4⁸)', () => {
  const counts = Object.fromEntries(MD_KEYS.map((t) => [t, 0])) as Record<MdKey, number>
  let ties = 0
  const total = 4 ** 8
  for (let n = 0; n < total; n++) {
    const ans = Array.from({ length: 8 }, (_, i) => Math.floor(n / 4 ** i) % 4)
    const r = interestResult(ans)
    counts[r.main]++
    if (r.tie) ties++
  }
  const pct = (x: number) => (x / total) * 100

  it.each([
    ['초급', 18.8],
    ['관리', 16.9],
    ['분석', 15.0],
    ['머신러닝', 17.8],
    ['마이닝', 16.1],
    ['고급', 15.4],
  ] as const)('%s %f%%', (t, expected) => {
    expect(Math.abs(pct(counts[t]) - expected)).toBeLessThanOrEqual(0.1)
  })

  it('관심 1위 동점 23.6%', () => {
    expect(Math.abs(pct(ties) - 23.6)).toBeLessThanOrEqual(0.1)
  })
})

describe('흥미 기반 사례', () => {
  it('2,1,1,0,2,1,1,1 → 머신러닝 (성장, 준비도 3)', () => {
    const r = interestResult([2, 1, 1, 0, 2, 1, 1, 1])
    expect(r.main).toBe('머신러닝')
    expect(r.stage).toBe('성장')
    expect(r.ready).toBe(3)
    expect(r.next).toBeNull()
    expect(r.scores).toEqual({ 관리: 0, 분석: 2, 머신러닝: 10, 마이닝: 0, 고급: 0 })
  })

  it('0,1,2,1,1,2,2,2 → 초급 (입문, 준비도 1), 다음 목표 마이닝', () => {
    const r = interestResult([0, 1, 2, 1, 1, 2, 2, 2])
    expect(r.main).toBe('초급')
    expect(r.stage).toBe('입문')
    expect(r.ready).toBe(1)
    expect(r.next).toBe('마이닝')
    expect(r.scores).toEqual({ 관리: 0, 분석: 2, 머신러닝: 1, 마이닝: 9, 고급: 2 })
  })

  it('심화 단계면 고급에 +2', () => {
    const r = interestResult([3, 3, 3, 3, 0, 0, 0, 3])
    expect(r.stage).toBe('심화')
    expect(r.scores.고급).toBe(1 + 1 + 2)
  })
})

describe('흥미 기반 함께 따기 (대표 4과목 가정)', () => {
  it.each([
    ['관리', '분석', '딥러닝'],
    ['분석', '머신러닝', '빅데이터윤리'],
    ['머신러닝', '분석', '빅데이터윤리'],
    ['마이닝', '고급', '다변량통계학'],
    ['고급', '마이닝', '데이터마이닝'],
  ] as const)('%s → %s +1 (%s)', (main, partner, slot) => {
    const p = interestPartner(main)
    expect(p?.md).toBe(partner)
    expect(p?.k).toBe(1)
    expect(p?.slots.map((s) => s.name)).toEqual([slot])
  })

  it('초급은 함께 따기 없음', () => {
    expect(interestPartner('초급')).toBeNull()
  })
})
