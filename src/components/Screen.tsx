import type { ReactNode } from 'react'
import backIcon from '../assets/icons/back.svg'
import styles from './Screen.module.css'

interface ScreenProps {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  footerClassName?: string
  stickyFooter?: boolean
}

/** 상단 바 · 본문 · 하단 영역으로 이루어진 화면 틀 */
export function Screen({ header, footer, children, className, bodyClassName, footerClassName, stickyFooter }: ScreenProps) {
  return (
    <div className={[styles.screen, className].filter(Boolean).join(' ')}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={[styles.body, bodyClassName].filter(Boolean).join(' ')}>{children}</main>
      {footer && <footer className={[styles.footer, stickyFooter && styles.sticky, footerClassName].filter(Boolean).join(' ')}>{footer}</footer>}
    </div>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.iconBtn} onClick={onClick} aria-label="뒤로 가기">
      <img src={backIcon} alt="" width={24} height={24} />
    </button>
  )
}

export function HeaderTitle({ children }: { children: ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>
}
