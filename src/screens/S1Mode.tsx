import type { Mode } from '../state/state'
import interestIcon from '../assets/icons/mode-interest.svg'
import courseIcon from '../assets/icons/mode-course.svg'
import { BackButton, Screen } from '../components/Screen'
import ui from '../components/ui.module.css'
import styles from './S1Mode.module.css'

export function S1Mode({ onSelect, onBack }: { onSelect: (m: Mode) => void; onBack: () => void }) {
  return (
    <Screen
      header={<BackButton onClick={onBack} />}
      bodyClassName={styles.body}
      footer={
        <>
          <button type="button" className={`${styles.mode} ${styles.primary}`} onClick={() => onSelect('interest')}>
            <img src={interestIcon} alt="" width={40} height={40} />
            <span className={styles.text}>
              <b>흥미 기반으로 알아보기</b>
              <small>아직 들어본 과목이 적거나, 관심사로 추천받아요</small>
            </span>
          </button>
          <button type="button" className={styles.mode} onClick={() => onSelect('course')}>
            <span className={styles.iconBox}>
              <img src={courseIcon} alt="" width={18} height={22} />
            </span>
            <span className={styles.text}>
              <b>과목 기반으로 알아보기</b>
              <small>수강했거나 관심있는 과목으로 추천받아요</small>
            </span>
          </button>
        </>
      }
    >
      <p className={styles.greeting}>안녕하세요, 서울시립대학교의 이루매에요!</p>
      <h1 className={`${ui.title} ${styles.heading}`}>
        몇가지 질문에만 답하면
        <br />
        딱 맞는 <em>마이크로디그리</em>를
        <br />
        추천해드릴게요!
      </h1>
      <div className={styles.stage}>
        <div className={styles.figure}>
          <p className={styles.bubble}>저와 함께 알아볼까요?</p>
          <div className={ui.orbit}>
            <img src="/mascot.png" alt="" width={200} height={200} />
          </div>
        </div>
      </div>
    </Screen>
  )
}
