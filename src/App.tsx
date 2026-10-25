import { useCallback, useEffect, useReducer, useRef } from 'react'
import { initialState, reducer, type Mode } from './state/state'
import { S0Start } from './screens/S0Start'
import { S1Mode } from './screens/S1Mode'
import { S2Dept } from './screens/S2Dept'
import { S3Question } from './screens/S3Question'
import { S4Courses } from './screens/S4Courses'
import { S5Loading } from './screens/S5Loading'
import { S6Result } from './screens/S6Result'

export default function App() {
  // 상태는 메모리에만 둔다. 새로고침하면 S0부터 다시 시작한다
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const stateRef = useRef(state)
  const fromPopstate = useRef(false)

  useEffect(() => {
    stateRef.current = state
  })

  // 브라우저 뒤로가기를 앱의 뒤로가기와 맞춘다. 화면(문항)이 바뀔 때마다 기록을 하나 쌓는다
  useEffect(() => {
    const onPop = () => {
      const s = stateRef.current
      if (reducer(s, { type: 'back' }) === s) return
      fromPopstate.current = true
      dispatch({ type: 'back' })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const { screen, q } = state
  const position = `${screen}:${screen === 'S3' ? q : ''}`
  useEffect(() => {
    if (fromPopstate.current) fromPopstate.current = false
    else if (position !== 'S0:') window.history.pushState(null, '')
    window.scrollTo(0, 0)
  }, [position])

  const back = useCallback(() => dispatch({ type: 'back' }), [])
  const finishLoading = useCallback(() => dispatch({ type: 'finishLoading' }), [])
  const restart = useCallback(() => dispatch({ type: 'restart' }), [])
  const tryOther = useCallback(() => dispatch({ type: 'tryOther' }), [])

  switch (state.screen) {
    case 'S0':
      return <S0Start onStart={() => dispatch({ type: 'start' })} />
    case 'S1':
      return <S1Mode onSelect={(mode: Mode) => dispatch({ type: 'chooseMode', mode })} onBack={back} />
    case 'S2':
      return (
        <S2Dept
          dept={state.dept}
          onChange={(dept) => dispatch({ type: 'chooseDept', dept })}
          onNext={() => dispatch({ type: 'deptNext' })}
          onSkip={() => dispatch({ type: 'deptSkip' })}
          onBack={back}
        />
      )
    case 'S3':
      return (
        <S3Question
          q={state.q}
          answers={state.answers}
          onAnswer={(value) => dispatch({ type: 'answer', value })}
          onAdvance={() => dispatch({ type: 'advanceQuestion' })}
          onBack={back}
        />
      )
    case 'S4':
      return (
        <S4Courses
          dept={state.dept}
          checked={state.checked}
          search={state.search}
          subsOpen={state.subsOpen}
          xOpen={state.xOpen}
          onToggle={(code) => dispatch({ type: 'toggleCode', code })}
          onToggleSubs={(slotId) => dispatch({ type: 'toggleSubs', slotId })}
          onToggleExchange={() => dispatch({ type: 'toggleExchange' })}
          onSearch={(text) => dispatch({ type: 'search', text })}
          onResult={() => dispatch({ type: 'showCourseResult' })}
          onToInterest={() => dispatch({ type: 'toInterest' })}
          onBack={back}
        />
      )
    case 'S5':
      return <S5Loading mode={state.resultMode ?? 'interest'} checkedCount={state.checked.size} onDone={finishLoading} />
    case 'S6': {
      const mode = state.resultMode ?? 'interest'
      const result = state.results[mode]
      if (!result) return <S0Start onStart={() => dispatch({ type: 'start' })} />
      return (
        <S6Result
          result={result}
          other={state.results[mode === 'interest' ? 'course' : 'interest']}
          dept={state.dept}
          checked={state.checked}
          onTryOther={tryOther}
          onRestart={restart}
        />
      )
    }
  }
}
