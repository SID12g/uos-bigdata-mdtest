// 받침에 따라 조사를 고른다. 예: josa('머신러닝', '과/와') → '머신러닝과'

export type JosaPair = '이/가' | '은/는' | '을/를' | '과/와' | '으로/로'

const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3
const RIEUL = 8

// 끝이 숫자·로마 숫자면 읽는 소리로 받침을 정한다 (예: 회귀분석Ⅰ → '일')
const READING: Record<string, string> = {
  '0': '영', '1': '일', '2': '이', '3': '삼', '4': '사', '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구',
  'Ⅰ': '일', 'Ⅱ': '이', 'Ⅲ': '삼', 'Ⅳ': '사', 'Ⅴ': '오',
}

/** 마지막 글자의 받침 번호. 읽을 수 없으면 0 */
function finalConsonant(word: string): number {
  const last = word.trim().replace(/[)\]」』"'”’]+$/, '').slice(-1)
  const code = (READING[last] ?? last).charCodeAt(0)
  if (code < HANGUL_START || code > HANGUL_END) return 0
  return (code - HANGUL_START) % 28
}

/** 조사만 돌려준다. 단어와 조사 사이에 괄호 등이 들어갈 때 쓴다 */
export function particle(word: string, pair: JosaPair): string {
  const [withB, noB] = pair.split('/')
  const fc = finalConsonant(word)
  // '으로/로'는 ㄹ 받침 뒤에서도 '로'
  if (pair === '으로/로') return fc > 0 && fc !== RIEUL ? withB : noB
  return fc > 0 ? withB : noB
}

export function josa(word: string, pair: JosaPair): string {
  return word + particle(word, pair)
}
