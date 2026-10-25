import { COURSES, LINKED, LINKED_REQUIRED, SLOTS, SLOT_GROUPS, type Slot } from '../data'
import { particle } from '../logic/josa'
import { isExchangeKey, slotCodes } from '../logic/slots'
import { Icon } from '../components/Icon'
import { BackButton, HeaderTitle, Screen } from '../components/Screen'
import ui from '../components/ui.module.css'
import styles from './S4Courses.module.css'

const OLD_CODES = new Set([
  ...SLOTS.flatMap((s) => s.old),
  ...Object.values(LINKED)
    .flat()
    .flatMap((l) => Object.keys(l.old ?? {})),
])

interface Props {
  dept: string | null | undefined
  checked: ReadonlySet<string>
  search: string
  subsOpen: ReadonlySet<string>
  xOpen: boolean
  onToggle: (code: string) => void
  onToggleSubs: (slotId: string) => void
  onToggleExchange: () => void
  onSearch: (text: string) => void
  onResult: () => void
  onToInterest: () => void
  onBack: () => void
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
const matches = (q: string, texts: string[]) => texts.some((t) => norm(t).includes(q))
const codeTexts = (c: string) => (isExchangeKey(c) ? [] : [c, COURSES[c]?.name ?? '', COURSES[c]?.dept ?? ''])

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q)
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className={styles.hl}>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

function CourseRow({
  code,
  label,
  q,
  checked,
  onToggle,
  variant,
  tags,
}: {
  code: string
  label?: string
  q: string
  checked: ReadonlySet<string>
  onToggle: (code: string) => void
  variant: 'main' | 'sub'
  tags?: string[]
}) {
  const on = checked.has(code)
  const name = label ?? COURSES[code]?.name ?? code
  const meta = isExchangeKey(code) ? '교내 미개설 · 타 대학 학점교류' : OLD_CODES.has(code) ? `${code} · 구 교과번호` : `${code} · ${COURSES[code]?.dept ?? ''}`
  return (
    <button type="button" className={`${styles.course} ${styles[variant]} ${on ? styles.on : ''}`} aria-pressed={on} onClick={() => onToggle(code)}>
      <span className={styles.box} aria-hidden="true">
        <Icon name="check" size={14} />
      </span>
      <span className={styles.courseText}>
        <b>
          <Highlight text={name} q={q} />
          {OLD_CODES.has(code) && <span className={styles.old}>(구)</span>}
        </b>
        <small>
          <Highlight text={meta} q={q} />
        </small>
      </span>
      {tags && (
        <span className={styles.tags} aria-label={`${tags.join(', ')} MD에 인정`}>
          {tags.map((t) => (
            <i key={t}>{t}</i>
          ))}
        </span>
      )}
    </button>
  )
}

function SlotCard({ slot, q, props }: { slot: Slot; q: string; props: Props }) {
  const extra = [...slot.subs, ...slot.old]
  const forced = !!q && matches(q, extra.flatMap(codeTexts))
  const open = props.subsOpen.has(slot.id) || forced
  const codes = slotCodes(slot)
  const any = codes.some((c) => props.checked.has(c))
  const mainCode = slot.exchange ? codes[0] : slot.main!
  return (
    <div className={`${styles.slot} ${any ? styles.slotOn : ''}`}>
      <CourseRow
        code={mainCode}
        label={slot.exchange ? slot.name : undefined}
        q={q}
        checked={props.checked}
        onToggle={props.onToggle}
        variant="main"
        tags={slot.md}
      />
      {extra.length > 0 && (
        <>
          <button type="button" className={`${styles.more} ${open ? styles.open : ''}`} aria-expanded={open} onClick={() => props.onToggleSubs(slot.id)}>
            이 과목도 인정돼요 · {extra.length}개
            <Icon name="chevDown" size={16} />
          </button>
          {open && (
            <div className={styles.subs}>
              {extra.map((c) => (
                <CourseRow key={c} code={c} q={q} checked={props.checked} onToggle={props.onToggle} variant="sub" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function S4Courses(props: Props) {
  const { dept, checked, search, xOpen } = props
  const q = norm(search)
  const hit = (s: Slot) => !q || matches(q, [s.name, ...slotCodes(s).flatMap(codeTexts)])
  const linked = dept ? LINKED[dept] : undefined
  const linkedRows = (linked ?? [])
    .map((l) => ({ ...l, codes: [...l.courses, ...Object.keys(l.old ?? {})].filter((c) => !q || matches(q, codeTexts(c))) }))
    .filter((l) => l.codes.length)
  const groups = SLOT_GROUPS.map((g) => ({ ...g, slots: SLOTS.filter((s) => s.group === g.id && hit(s)) })).filter((g) => g.slots.length)
  const exchange = SLOTS.filter((s) => s.exchange && hit(s))
  const exchangeOpen = xOpen || !!q
  const empty = !linkedRows.length && !groups.length && !exchange.length
  const n = checked.size

  return (
    <Screen
      stickyFooter
      header={
        <>
          <BackButton onClick={props.onBack} />
          <HeaderTitle>들은 과목 체크</HeaderTitle>
        </>
      }
      footer={
        n ? (
          <button type="button" className={ui.cta} onClick={props.onResult}>
            결과 보기 <small>({n}개 선택)</small>
          </button>
        ) : (
          <button type="button" className={ui.line} onClick={props.onToInterest}>
            아직 들은 과목이 없다면 흥미 기반으로 알아봐요
          </button>
        )
      }
    >
      <p className={styles.lead}>
        들었거나 지금 듣고 있는 과목을
        <br />
        모두 골라주세요
      </p>
      <p className={`${ui.hint} ${styles.note}`}>
        <Icon name="info" size={15} />
        <span>인정은 과목명이 아니라 교과번호로 판정해요. 번호를 꼭 확인해 주세요</span>
      </p>
      <label className={styles.search}>
        <Icon name="search" size={20} />
        <input
          type="search"
          value={search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="과목명 또는 교과번호로 찾기"
          autoComplete="off"
          aria-label="과목 검색"
        />
      </label>

      {linkedRows.length > 0 && (
        <section className={styles.group} aria-labelledby="grp-linked">
          <h2 id="grp-linked">
            내 학과 연계 과목 <small>{dept}</small>
          </h2>
          <div className={styles.slots}>
            {linkedRows.map((l) => (
              <div key={l.md} className={`${styles.slot} ${l.codes.some((c) => checked.has(c)) ? styles.slotOn : ''}`}>
                <p className={styles.linkedHead}>{l.md} 지정 과목 · 2개 필요</p>
                <div className={styles.subs}>
                  {l.codes.map((c) => (
                    <CourseRow key={c} code={c} q={q} checked={checked} onToggle={props.onToggle} variant="sub" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className={styles.groupNote}>
            연계융합 MD의 필수 과목인 {LINKED_REQUIRED.name}({LINKED_REQUIRED.codes[0]}){particle(LINKED_REQUIRED.name, '은/는')} 아래 기초 묶음에서
            골라주세요.{' '}
            {LINKED_REQUIRED.notAccepted.map((x) => `${x.name}(${x.code})${particle(x.name, '은/는')}`).join(', ')} 필수로 인정되지 않아요
          </p>
        </section>
      )}

      {groups.map((g) => (
        <section key={g.id} className={styles.group} aria-labelledby={`grp-${g.id}`}>
          <h2 id={`grp-${g.id}`}>
            {g.name} <small>{g.slots.length}</small>
          </h2>
          <div className={styles.slots}>
            {g.slots.map((s) => (
              <SlotCard key={s.id} slot={s} q={q} props={props} />
            ))}
          </div>
        </section>
      ))}

      {exchange.length > 0 && (
        <section className={styles.group}>
          <button type="button" className={`${styles.xHead} ${exchangeOpen ? styles.open : ''}`} aria-expanded={exchangeOpen} onClick={props.onToggleExchange}>
            타 대학 학점교류로 들은 과목 <small>{exchange.length}</small>
            <Icon name="chevDown" size={18} />
          </button>
          {exchangeOpen && (
            <div className={`${styles.slots} ${styles.xList}`}>
              {exchange.map((s) => (
                <SlotCard key={s.id} slot={s} q={q} props={props} />
              ))}
            </div>
          )}
        </section>
      )}

      {empty && (
        <p className={styles.empty}>
          검색어와 맞는 과목이 없어요.
          <br />
          교과번호 다섯 자리로 다시 찾아보세요
        </p>
      )}
    </Screen>
  )
}
