import { DEPTS, LINKED } from '../data'
import checkIcon from '../assets/icons/check.svg'
import sparkleIcon from '../assets/icons/sparkle.svg'
import { BackButton, Screen } from '../components/Screen'
import ui from '../components/ui.module.css'
import styles from './S2Dept.module.css'

interface Props {
  dept: string | null | undefined
  onChange: (dept: string | null) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
}

function DeptButton({ label, on, wide, onClick }: { label: string; on: boolean; wide?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.dept} ${on ? styles.on : ''} ${wide ? styles.wide : ''}`} aria-pressed={on} onClick={onClick}>
      {on && <img src={checkIcon} alt="" width={16} height={16} />}
      {label}
    </button>
  )
}

export function S2Dept({ dept, onChange, onNext, onSkip, onBack }: Props) {
  const linked = dept ? LINKED[dept] : undefined

  return (
    <Screen
      header={<BackButton onClick={onBack} />}
      footer={
        <>
          {(linked || dept === null) && (
            <p className={styles.note} role="status">
              <img src={sparkleIcon} alt="" width={16} height={16} />
              {linked ? (
                <span>
                  {dept}에는 <b>{linked.map((l) => l.md).join(', ')}</b> 연계융합 MD가 있어요
                </span>
              ) : (
                <span>표준 MD 6종 중에서 추천해 드릴게요</span>
              )}
            </p>
          )}
          <button type="button" className={ui.cta} onClick={onNext} disabled={dept === undefined}>
            다음
          </button>
          <button type="button" className={ui.textBtn} onClick={onSkip}>
            건너뛰기
          </button>
        </>
      }
    >
      <h1 className={ui.title}>어느 학과인가요?</h1>
      <p className={ui.subtitle}>학과에 연계융합 MD가 있으면 결과에서 함께 알려드려요</p>

      <div className={styles.grid} role="group" aria-label="학부·과">
        {DEPTS.map((d) => (
          <DeptButton key={d} label={d} on={dept === d} onClick={() => onChange(d)} />
        ))}
        <DeptButton label="그 외 학과" wide on={dept === null} onClick={() => onChange(null)} />
      </div>
    </Screen>
  )
}
