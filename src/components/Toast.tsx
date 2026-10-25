import styles from './Toast.module.css'

/** 화면 아래에 잠깐 떴다 사라지는 안내 */
export function Toast({ message }: { message: string | null }) {
  return (
    <div className={`${styles.toast} ${message ? styles.show : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
