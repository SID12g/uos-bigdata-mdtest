import { useRef, useState, type ReactNode, type Ref } from 'react'
import { COURSES, LINKED, LINKED_REQUIRED, OPEN_THIS_TERM, SLOTS, TERM, TYPES, type MdKey, type Slot } from '../data'
import type { CourseResult } from '../logic/course'
import { INTEREST, interestPartner, type InterestResult } from '../logic/interest'
import { josa, particle } from '../logic/josa'
import type { LinkedProgress } from '../logic/linked'
import type { Partner } from '../logic/partner'
import { ORDER, SLOT_BY_ID, openCodes, slotCodes, tierOf } from '../logic/slots'
import { saveNodeAsPng } from '../lib/saveImage'
import { Icon } from '../components/Icon'
import { HeaderTitle, Screen } from '../components/Screen'
import { Toast } from '../components/Toast'
import { useToast } from '../components/useToast'
import ui from '../components/ui.module.css'
import styles from './S6Result.module.css'

const fullName = (t: MdKey) => TYPES[t].full
const courseName = (c: string) => COURSES[c]?.name ?? c

interface Props {
  result: InterestResult | CourseResult
  other: InterestResult | CourseResult | null
  dept: string | null | undefined
  checked: ReadonlySet<string>
  onTryOther: () => void
  onRestart: () => void
}

function Card({ title, sub, tone, children }: { title: ReactNode; sub?: ReactNode; tone?: 'good' | 'warn'; children?: ReactNode }) {
  return (
    <section className={`${styles.card} ${tone ? styles[tone] : ''}`}>
      <h2>{title}</h2>
      {sub && <p className={styles.cardSub}>{sub}</p>}
      {children}
    </section>
  )
}

function SlotBadge({ slot }: { slot: Slot }) {
  const tier = tierOf(slot)
  if (tier === 0) {
    const open = openCodes(slot)
    const via = slot.main && open.includes(slot.main) ? '' : ` · ${open[0]}`
    return <span className={`${styles.badge} ${styles.badgeOpen}`}>{`${TERM}학기 개설${via}`}</span>
  }
  if (tier === 2) return <span className={`${styles.badge} ${styles.badgeX}`}>학점교류</span>
  return <span className={`${styles.badge} ${styles.badgeIn}`}>교내 · 이번 학기 없음</span>
}

function slotMeta(slot: Slot) {
  return slot.exchange ? '교내 미개설' : `${slot.main} · ${COURSES[slot.main!].dept}`
}

function RoadRow({ mark, name, meta, done, badge }: { mark: ReactNode; name: string; meta: string; done?: boolean; badge?: ReactNode }) {
  return (
    <li className={done ? styles.roadDone : undefined}>
      <span className={styles.roadMark} aria-hidden="true">
        {mark}
      </span>
      <span>
        <b>{name}</b>
        <small>{meta}</small>
      </span>
      {badge}
      {done && <span className="visually-hidden">들은 과목</span>}
    </li>
  )
}

function RepRoadmap({ md }: { md: MdKey }) {
  return (
    <ol className={styles.road}>
      {TYPES[md].rep.map((id, i) => {
        const slot = SLOT_BY_ID.get(id)!
        return <RoadRow key={id} mark={i + 1} name={slot.name} meta={slotMeta(slot)} badge={<SlotBadge slot={slot} />} />
      })}
    </ol>
  )
}

function Hero({ r, refEl }: { r: InterestResult | CourseResult; refEl: Ref<HTMLElement> }) {
  const md = TYPES[r.main]
  const isI = r.mode === 'interest'
  const eyebrow = isI ? (r.stage === '입문' ? '지금 시작하기 좋은 MD' : '나의 빅데이터 유형') : '지금 가장 가까운 MD'
  return (
    <section className={styles.hero} ref={refEl} aria-labelledby="result-persona">
      <img className={styles.heroImg} src={`/${md.image}`} alt={`${md.persona} 캐릭터`} width={150} height={150} />
      <div className={styles.titles}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.persona} id="result-persona">
          {md.persona}
        </h2>
      </div>
      <span className={styles.mdPill}>
        {md.full} MD
        {!isI && <span className={styles.mdPillProg}>· {r.prog[r.main]}/4</span>}
      </span>
      <p className={styles.line}>{md.line}</p>
      <div className={styles.tags}>
        {md.tags.map((t) => (
          <i key={t}>#{t}</i>
        ))}
      </div>
      {isI && r.next && (
        <div className={styles.next}>
          <span className={styles.nextBadge}>다음 목표</span>
          <b>{fullName(r.next)}</b> MD
        </div>
      )}
    </section>
  )
}

function InterestEvidence({ r }: { r: InterestResult }) {
  const max = Math.max(10, r.best)
  const sorted = [...INTEREST].sort((a, b) => r.scores[b] - r.scores[a] || ORDER.indexOf(a) - ORDER.indexOf(b))
  const stages = [
    ['입문', '0–1'],
    ['성장', '2–4'],
    ['심화', '5–6'],
  ] as const
  const tieBy = r.how === 'Q8' ? '5년 뒤 모습(Q8)' : r.how === 'Q5' ? '팀플 역할(Q5)' : '정해진 순서'
  return (
    <Card title="왜 이 결과가 나왔나요" sub="준비도로 단계를, 관심 점수로 방향을 정했어요">
      <p className={styles.subHead}>
        준비도 {r.ready}/6 · <span className={styles.accent}>{r.stage} 단계</span>
      </p>
      <div className={styles.ready} role="progressbar" aria-label="준비도" aria-valuemin={0} aria-valuemax={6} aria-valuenow={r.ready}>
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} className={i <= r.ready ? styles.filled : undefined} />
        ))}
      </div>
      <div className={styles.readyLabels}>
        {stages.map(([s, range]) => (
          <span key={s} className={r.stage === s ? styles.accentStrong : undefined}>
            {s} {range}
          </span>
        ))}
      </div>
      <p className={styles.subHead}>관심 점수</p>
      <div className={styles.bars}>
        {sorted.map((t) => (
          <div key={t} className={`${styles.bar} ${t === r.top ? styles.barTop : ''}`}>
            <span>{fullName(t)}</span>
            <span className={styles.track} role="progressbar" aria-label={`${fullName(t)} 관심 점수`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={r.scores[t]}>
              <span style={{ width: `${(r.scores[t] / max) * 100}%` }} />
            </span>
            <span className={styles.barValue}>{r.scores[t]}</span>
          </div>
        ))}
      </div>
      {r.tie && (
        <p className={styles.fine}>
          {josa(r.tie.map(fullName).join('·'), '이/가')} 동점이라 {josa(tieBy, '으로/로')} 골랐어요
        </p>
      )}
    </Card>
  )
}

function CourseEvidence({ r, count }: { r: CourseResult; count: number }) {
  return (
    <Card title="MD별 진행률" sub={`체크한 과목 ${count}개를 교과번호로 맞춰봤어요`}>
      <div className={styles.bars}>
        {r.ranked.map((t) => (
          <div key={t} className={`${styles.bar} ${t === r.main ? styles.barTop : ''} ${r.prog[t] === 4 ? styles.barDone : ''}`}>
            <span>{fullName(t)}</span>
            <span className={styles.pips} role="progressbar" aria-label={`${fullName(t)} 진행률`} aria-valuemin={0} aria-valuemax={4} aria-valuenow={r.prog[t]}>
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={i < r.prog[t] ? styles.filled : undefined} />
              ))}
            </span>
            <span className={styles.barValue}>{r.prog[t]}/4</span>
          </div>
        ))}
      </div>
      {r.tie && <p className={styles.fine}>{josa(r.tie.map(fullName).join('·'), '이/가')} 동점이라 이번 학기에 열리는 남은 과목이 더 많은 쪽을 골랐어요</p>}
    </Card>
  )
}

function CourseRoadmap({ r, checked }: { r: CourseResult; checked: ReadonlySet<string> }) {
  const takenSlots = SLOTS.filter((s) => s.md.includes(r.main) && r.taken.has(s.id)).slice(0, 4)
  return (
    <Card
      title={r.recs.length ? `${r.recs.length}과목만 더 들으면 돼요` : '4과목을 모두 들었어요'}
      sub={`${fullName(r.main)} MD 로드맵 · 남은 과목은 이번 학기 개설 과목부터 추천해요`}
    >
      <ol className={styles.road}>
        {takenSlots.map((s) => {
          const c = slotCodes(s).find((x) => checked.has(x))!
          const name = s.exchange ? s.name : courseName(c)
          const meta = s.exchange ? '학점교류로 이수' : c === s.main ? `${c} · 들은 과목` : `${c} · ${s.name} 인정`
          return <RoadRow key={s.id} done mark={<Icon name="check" size={14} />} name={name} meta={meta} />
        })}
        {r.recs.map((s, i) => (
          <RoadRow key={s.id} mark={takenSlots.length + i + 1} name={s.name} meta={slotMeta(s)} badge={<SlotBadge slot={s} />} />
        ))}
      </ol>
      <p className={styles.fine}>개설 정보는 {TERM}학기 기준이에요</p>
    </Card>
  )
}

function PartnerCard({ p, message, plus }: { p: Partner; message: ReactNode; plus: boolean }) {
  return (
    <Card title="함께 따기 좋은 MD" sub="겹치는 과목은 두 MD에 동시에 인정돼요">
      <div className={styles.pair}>
        <span className={styles.pairK}>
          {plus ? '+' : ''}
          {p.k}
          <small>과목</small>
        </span>
        <p>{message}</p>
      </div>
      <ol className={styles.road}>
        {p.slots.map((s) => (
          <RoadRow key={s.id} mark="+" name={s.name} meta={`${s.md.map(fullName).join('·')}에 인정`} badge={<SlotBadge slot={s} />} />
        ))}
      </ol>
      <p className={styles.fine}>졸업·성적증명서에는 2개 과정까지 기재돼요</p>
    </Card>
  )
}

function coursePartnerMessage(r: CourseResult, p: Partner): ReactNode {
  const partner = <b>{fullName(p.md)}</b>
  if (p.k === p.needA) {
    const swapIn = p.slots.filter((s) => !r.recs.includes(s))
    if (swapIn.length) {
      const names = swapIn.map((s) => s.name).join('·')
      return (
        <>
          추천 과목 대신 <b>{names}</b>
          {particle(names, '을/를')} 들으면 추가 부담 없이 {partner} MD까지 4/4가 돼요
        </>
      )
    }
    return <>추천 과목만 들어도 {partner} MD까지 함께 채워져요</>
  }
  const main = fullName(r.main)
  return (
    <>
      지금부터 <b>{p.k}과목</b>이면 {josa(main, '과/와')} <b>{fullName(p.md)}</b>
      {particle(fullName(p.md), '을/를')} 함께 받을 수 있어요 ({main}만은 {p.needA}과목)
    </>
  )
}

function Check({ on }: { on: boolean }) {
  return (
    <span className={`${styles.ck} ${on ? styles.ckOn : ''}`} aria-hidden="true">
      {on && <Icon name="check" size={12} />}
    </span>
  )
}

function LinkedCard({ dept, rows }: { dept: string; rows: (LinkedProgress | (Omit<LinkedProgress, 'n'> & { n: null }))[] }) {
  const req = LINKED_REQUIRED
  return (
    <Card title="내 학과 연계융합 MD" sub={`${dept} 전공과 묶어 받는 과정이에요`}>
      {rows.map((l) => (
        <div key={l.md} className={styles.linked}>
          <div className={styles.linkedHead}>
            <b>{l.md}</b>
            {l.n != null && <span className={`${styles.badge} ${l.n === 4 ? styles.badgeOk : styles.badgeIn}`}>{l.n}/4</span>}
          </div>
          <ul className={styles.reqs}>
            <li>
              <Check on={l.req} />
              <span>
                {req.name} {req.codes[0]} <b>필수</b>
                <small className={styles.reqNote}>
                  {req.notAccepted.map((x) => `${x.name}(${x.code})${particle(x.name, '은/는')}`).join(', ')} 인정되지 않아요
                </small>
              </span>
            </li>
            <li>
              <Check on={l.designated.length >= 2} />
              <span>
                지정 과목 중 2개{l.n != null && ` (${Math.min(l.designated.length, 2)}/2)`}
                <span className={styles.chips}>
                  {l.courses.map((c) => (
                    <span key={c} className={l.designated.includes(c) ? styles.chipTaken : OPEN_THIS_TERM.has(c) ? styles.chipOpen : undefined}>
                      {courseName(c)} {c}
                      {l.designated.includes(c) && <span className="visually-hidden"> (들은 과목)</span>}
                      {!l.designated.includes(c) && OPEN_THIS_TERM.has(c) && <span className="visually-hidden"> ({TERM}학기 개설)</span>}
                    </span>
                  ))}
                </span>
              </span>
            </li>
            <li>
              <Check on={!!l.major} />
              <span>빅데이터전공 교과목 1개{l.major ? ` · ${courseName(l.major)}` : ' · 표준 MD 과목 대부분 해당'}</span>
            </li>
          </ul>
        </div>
      ))}
      <p className={styles.fine}>파란 테두리는 {TERM}학기 개설 과목이에요. 타과 전공은 졸업학점에서 일반선택으로 인정될 수 있어요</p>
    </Card>
  )
}

export function S6Result({ result: r, other, dept, checked, onTryOther, onRestart }: Props) {
  const heroRef = useRef<HTMLElement>(null)
  const [saving, setSaving] = useState(false)
  const [toast, showToast] = useToast()
  const isI = r.mode === 'interest'
  const linked = dept ? LINKED[dept] : undefined

  const save = async () => {
    if (!heroRef.current || saving) return
    setSaving(true)
    try {
      await saveNodeAsPng(heroRef.current, `빅데이터MD유형-${fullName(r.main)}.png`)
      showToast('결과 이미지를 저장했어요')
    } catch {
      showToast('이미지를 저장하지 못했어요. 화면을 캡처해 주세요')
    } finally {
      setSaving(false)
    }
  }

  let partnerCard: ReactNode = null
  if (isI && r.next) {
    partnerCard = (
      <Card title={`다음 목표 · ${fullName(r.next)}`} sub="초급으로 기초를 다진 뒤 이어서 도전해 보세요">
        <RepRoadmap md={r.next} />
      </Card>
    )
  } else if (isI) {
    const p = interestPartner(r.main)
    if (p)
      partnerCard = (
        <PartnerCard
          p={p}
          plus
          message={
            <>
              대표 4과목에 <b>{p.k}과목</b>만 더하면 <b>{fullName(p.md)}</b> MD까지 받을 수 있어요
            </>
          }
        />
      )
  } else if (r.partner) {
    partnerCard = <PartnerCard p={r.partner} plus={false} message={coursePartnerMessage(r, r.partner)} />
  }

  return (
    <Screen header={<HeaderTitle>나의 결과</HeaderTitle>}>
      <Hero r={r} refEl={heroRef} />

      {!isI && r.done.length > 0 && (
        <Card title="이미 요건 충족! 인증 신청하세요" tone="good">
          <p className={styles.cardText}>
            {josa(r.done.map(fullName).join(', '), '은/는')} 4과목을 모두 들었어요. 졸업 전에 인증을 신청하세요.
            {r.done.length >= 3 && ' 증명서에는 2개 과정까지 기재돼요.'}
          </p>
        </Card>
      )}
      {!isI && r.weak && (
        <Card title="흥미 기반으로도 확인해 보세요" tone="warn">
          <p className={styles.cardText}>모든 MD가 1과목 이하라서 진행률만으로는 추천 근거가 약해요.</p>
          <button type="button" className={`${ui.line} ${styles.miniBtn}`} onClick={onTryOther}>
            흥미 기반으로 알아보기
          </button>
        </Card>
      )}

      {isI ? <InterestEvidence r={r} /> : <CourseEvidence r={r} count={checked.size} />}

      {isI ? (
        <Card title="추천 수강 로드맵" sub={`${fullName(r.main)} MD · 4과목(12학점)을 들으면 이수해요`}>
          <RepRoadmap md={r.main} />
          <p className={styles.fine}>개설 정보는 {TERM}학기 기준이에요</p>
        </Card>
      ) : (
        <CourseRoadmap r={r} checked={checked} />
      )}

      {partnerCard}

      {dept && linked && (
        <LinkedCard dept={dept} rows={isI ? linked.map((l) => ({ ...l, req: false, designated: [], major: null, n: null })) : r.linked} />
      )}

      {other && (
        <Card title="두 방식 결과 비교" sub={other.main === r.main ? '두 방식 모두 같은 MD를 가리켜요' : '관심 방향과 지금 가까운 MD가 달라요. 둘 다 고려해 보세요'}>
          <div className={styles.compare}>
            <div className={isI ? styles.compareCur : undefined}>
              <small>흥미 기반</small>
              <b>{fullName((isI ? r : other).main)}</b>
            </div>
            <div className={!isI ? styles.compareCur : undefined}>
              <small>과목 기반</small>
              <b>{fullName((isI ? other : r).main)}</b>
            </div>
          </div>
        </Card>
      )}

      <Card title="이수 신청 방법" sub="복수 과정은 과정마다 따로 신청해요">
        <ol className={styles.steps}>
          <li>
            <span>
              <b>이수 신청</b>
              <Path items={['대학행정', '학적', '모듈형교육과정이수(포기) 신청']} button="이수신청" />
            </span>
          </li>
          <li>
            <span>
              <b>지정 과목 수강</b>
              <span className={styles.path}>4과목 · 12학점</span>
            </span>
          </li>
          <li>
            <span>
              <b>이수 인증 신청</b>
              <Path items={['대학행정', '학적', '모듈형교육과정이수 인증 신청']} button="인증신청" />
              <span className={styles.must}>졸업 전 반드시 신청 · 졸업 후 불가</span>
            </span>
          </li>
        </ol>
      </Card>

      <p className={styles.footNote}>
        추천 결과예요. 최종 인정은 교과번호 기준으로 사업단이 확인해요.
        <br />
        교과 문의 <a href="tel:02-6490-6926">02-6490-6926</a>~6927
      </p>

      <section className={styles.end} aria-label="다음 행동">
        <button type="button" className={ui.cta} onClick={onTryOther}>
          {isI ? '과목 기반으로도 알아보기' : '흥미 기반으로도 알아보기'}
        </button>
        <div className={styles.row2}>
          <button type="button" className={ui.secondary} onClick={onRestart}>
            다시 하기
          </button>
          <button type="button" className={ui.secondary} onClick={save} disabled={saving} aria-busy={saving}>
            {saving ? '저장 중…' : '결과 이미지 저장'}
          </button>
        </div>
      </section>
      <p className={styles.disclaimer}>
        테스트 내용은 참고용이며 정확하지 않을 수 있습니다. MD 이수에 관한 자세한 사항은 학교 홈페이지를 확인하시거나 담당자에게 문의해 주세요.
      </p>
      <Toast message={toast} />
    </Screen>
  )
}

function Path({ items, button }: { items: string[]; button: string }) {
  return (
    <span className={styles.path}>
      {items.map((x) => (
        <span key={x}>
          <span className={styles.pathItem}>{x}</span>
          <span aria-hidden="true">›</span>
        </span>
      ))}
      <span className={`${styles.pathItem} ${styles.pathBtn}`}>{button}</span>
    </span>
  )
}
