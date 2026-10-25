// 화면에서 쓰는 선 아이콘. 장식용이므로 aria-hidden.
const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevDown: <path d="M6 9l6 6 6-6" />,
  chevRight: <path d="M9 6l6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.2" />
    </>
  ),
  spark: <path d="M12 3l2.3 5.6 6 .4-4.6 3.8 1.5 5.9L12 15.5l-5.2 3.2 1.5-5.9L3.7 9l6-.4z" />,
  list: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M7.5 9l1.6 1.6 2.8-3.1M7.5 15l1.6 1.6 2.8-3.1M14.5 9.5h3M14.5 15.5h3" />
    </>
  ),
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
