import { toPng } from 'html-to-image'

// Pretendard는 유니코드 범위별 subset 92개로 나뉘어 있다.
// html-to-image에 맡기면 전부 내려받으므로, 캡처할 글자가 쓰는 subset만 골라 넣는다.

function parseRanges(unicodeRange: string): [number, number][] {
  return unicodeRange
    .split(',')
    .map((r) => r.trim().replace(/^U\+/i, ''))
    .filter(Boolean)
    .map((r) => {
      const [a, b] = r.split('-')
      return [parseInt(a, 16), parseInt(b ?? a, 16)] as [number, number]
    })
}

function fontFaceRules(): CSSFontFaceRule[] {
  const out: CSSFontFaceRule[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const r of Array.from(rules)) if (r instanceof CSSFontFaceRule) out.push(r)
  }
  return out
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

async function fontEmbedCss(node: HTMLElement): Promise<string> {
  const used = new Set(Array.from(node.textContent ?? '', (ch) => ch.codePointAt(0)!))
  const rules = fontFaceRules().filter((rule) => {
    const range = rule.style.getPropertyValue('unicode-range')
    if (!range) return true
    const ranges = parseRanges(range)
    for (const cp of used) if (ranges.some(([a, b]) => cp >= a && cp <= b)) return true
    return false
  })
  const css = await Promise.all(
    rules.map(async (rule) => {
      const base = rule.parentStyleSheet?.href ?? document.baseURI
      const src = rule.style.getPropertyValue('src')
      const urls = [...src.matchAll(/url\((['"]?)(.+?)\1\)/g)].map((m) => m[2])
      let text = rule.cssText
      for (const u of urls) {
        if (u.startsWith('data:')) continue
        const res = await fetch(new URL(u, base))
        if (!res.ok) throw new Error(`font ${u} ${res.status}`)
        text = text.split(u).join(await toDataUrl(await res.blob()))
      }
      return text
    }),
  )
  return css.join('\n')
}

/** node를 PNG로 저장한다. 실패하면 예외를 던진다 */
export async function saveNodeAsPng(node: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: false,
    backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-bg').trim() || undefined,
    fontEmbedCSS: await fontEmbedCss(node),
  })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}
