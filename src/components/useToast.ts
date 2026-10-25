import { useCallback, useEffect, useRef, useState } from 'react'

/** 토스트 문구와, 문구를 잠깐 띄우는 함수 */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const show = useCallback(
    (text: string) => {
      clearTimeout(timer.current)
      setMessage(text)
      timer.current = setTimeout(() => setMessage(null), duration)
    },
    [duration],
  )
  useEffect(() => () => clearTimeout(timer.current), [])
  return [message, show] as const
}
