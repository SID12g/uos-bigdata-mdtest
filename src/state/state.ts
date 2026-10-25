import { QUESTIONS, SLOTS } from '../data'
import { courseResult, type CourseResult } from '../logic/course'
import { interestResult, type InterestResult } from '../logic/interest'

export type ScreenId = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'
export type Mode = 'interest' | 'course'

export interface State {
  screen: ScreenId
  mode: Mode | null
  /** undefined: 아직 고르지 않음 · null: 그 외 학과/건너뛰기 */
  dept: string | null | undefined
  /** S3 현재 문항 (0–7) */
  q: number
  answers: (number | null)[]
  checked: ReadonlySet<string>
  search: string
  /** S4에서 대체 과목을 펼친 슬롯 */
  subsOpen: ReadonlySet<string>
  /** S4 학점교류 묶음 펼침 */
  xOpen: boolean
  /** S5·S6에서 보여줄 결과 종류 */
  resultMode: Mode | null
  results: { interest: InterestResult | null; course: CourseResult | null }
}

export type Action =
  | { type: 'start' }
  | { type: 'back' }
  | { type: 'chooseMode'; mode: Mode }
  | { type: 'chooseDept'; dept: string | null }
  | { type: 'deptNext' }
  | { type: 'deptSkip' }
  | { type: 'answer'; value: number }
  | { type: 'advanceQuestion' }
  | { type: 'toggleCode'; code: string }
  | { type: 'toggleSubs'; slotId: string }
  | { type: 'toggleExchange' }
  | { type: 'search'; text: string }
  | { type: 'showCourseResult' }
  | { type: 'toInterest' }
  | { type: 'finishLoading' }
  | { type: 'tryOther' }
  | { type: 'restart' }

export function initialState(): State {
  return {
    screen: 'S0',
    mode: null,
    dept: undefined,
    q: 0,
    answers: Array<number | null>(QUESTIONS.length).fill(null),
    checked: new Set(),
    search: '',
    subsOpen: new Set(SLOTS.filter((s) => s.subsOpen).map((s) => s.id)),
    xOpen: false,
    resultMode: null,
    results: { interest: null, course: null },
  }
}

function toggle(set: ReadonlySet<string>, v: string): Set<string> {
  const next = new Set(set)
  if (next.has(v)) next.delete(v)
  else next.add(v)
  return next
}

const toQuestions = (s: State): State => ({ ...s, screen: 'S3', mode: 'interest', q: 0 })
const afterDept = (s: State): State => (s.mode === 'course' ? { ...s, screen: 'S4' } : toQuestions(s))

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return { ...s, screen: 'S1' }
    case 'back':
      switch (s.screen) {
        case 'S1':
          return { ...s, screen: 'S0' }
        case 'S2':
          return { ...s, screen: 'S1' }
        case 'S3':
          return s.q > 0 ? { ...s, q: s.q - 1 } : { ...s, screen: 'S2' }
        case 'S4':
          return { ...s, screen: 'S2' }
        default:
          return s
      }
    case 'chooseMode':
      return { ...s, mode: a.mode, screen: 'S2' }
    case 'chooseDept':
      return { ...s, dept: a.dept }
    case 'deptNext':
      return s.dept === undefined ? s : afterDept(s)
    case 'deptSkip':
      return afterDept({ ...s, dept: null })
    case 'answer': {
      if (s.screen !== 'S3') return s
      const answers = s.answers.slice()
      answers[s.q] = a.value
      return { ...s, answers }
    }
    case 'advanceQuestion':
      if (s.screen !== 'S3' || s.answers[s.q] == null) return s
      if (s.q < QUESTIONS.length - 1) return { ...s, q: s.q + 1 }
      return { ...s, screen: 'S5', resultMode: 'interest' }
    case 'toggleCode':
      return { ...s, checked: toggle(s.checked, a.code) }
    case 'toggleSubs':
      return { ...s, subsOpen: toggle(s.subsOpen, a.slotId) }
    case 'toggleExchange':
      return { ...s, xOpen: !s.xOpen }
    case 'search':
      return { ...s, search: a.text }
    case 'showCourseResult':
      return s.checked.size ? { ...s, screen: 'S5', resultMode: 'course' } : s
    case 'toInterest':
      return toQuestions(s)
    case 'finishLoading': {
      if (s.screen !== 'S5' || !s.resultMode) return s
      const results =
        s.resultMode === 'interest'
          ? { ...s.results, interest: interestResult(s.answers) }
          : { ...s.results, course: courseResult(s.checked, s.dept) }
      return { ...s, screen: 'S6', results }
    }
    case 'tryOther':
      return s.resultMode === 'interest' ? { ...s, screen: 'S4', mode: 'course' } : toQuestions(s)
    case 'restart':
      return initialState()
  }
}
