/* eslint-disable functional/no-expression-statements */
import { Eq, Equal, F, Runtime, pipe } from 'fp'
import React from 'react'
import { UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { RootState } from 'src/model'
import { AppRuntime } from 'src/runtime'
import { StateRef } from '../services/StateRef'

export const select =
  <A>(selector: (state: RootState) => A, equivalence?: Eq.Equivalence<A>) =>
  (uiComponent: (selected: A) => UIElement): UIElement => {
    const selected = useSelector(selector, equivalence)
    return uiComponent(selected)
  }

export const useSelector = <A>(
  selector: (state: RootState) => A,
  equivalence?: Eq.Equivalence<A>,
) => {
  const runtime = useRuntime()
  return useSelectorComplete({
    selector,
    equivalence: equivalence ?? Equal.equivalence(),
    runtime,
  })
}

export const useSelectorComplete = <A>({
  selector,
  equivalence,
  runtime,
}: {
  selector: (state: RootState) => A
  equivalence: Eq.Equivalence<A>
  runtime: AppRuntime
}): A => {
  const [state, setState] = React.useState<A>(() =>
    StateRef.get.pipe(F.map(selector), Runtime.runSync(runtime)),
  )
  React.useEffect(() => {
    const subscription = pipe(
      StateRef.react.subscribe(r =>
        pipe(selector(r), s =>
          F.sync(() => {
            setState(state => (equivalence(s, state) ? state : s))
          }),
        ),
      ),
      Runtime.runSync(runtime),
    )
    return () => void Runtime.runSync(runtime)(subscription.unsubscribe())
  }, [selector, equivalence, runtime])
  return state
}
