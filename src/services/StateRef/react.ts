/* eslint-disable functional/no-expression-statements */
import { Eq, Equal, F, Runtime, pipe } from 'fp'
import React from 'react'
import { UIElement } from 'src/components/types'
import { RootState } from 'src/model'
import { StateRef } from '.'
import { UIEnv } from '../UI'

export const select =
  <A>(selector: (state: RootState) => A, equivalence?: Eq.Equivalence<A>) =>
  (uiComponent: (selected: A) => UIElement): UIElement =>
  env => {
    const selected = useSelectorComplete({
      selector,
      equivalence: equivalence ?? Equal.equivalence(),
      env,
    })
    return uiComponent(selected)(env)
  }

export const useSelectorComplete = <A>({
  selector,
  equivalence,
  env,
}: {
  selector: (state: RootState) => A
  equivalence: Eq.Equivalence<A>
  env: UIEnv
}): A => {
  const [state, setState] = React.useState<A>(() =>
    StateRef.get.pipe(F.map(selector), Runtime.runSync(env.runtime)),
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
      Runtime.runSync(env.runtime),
    )
    return () => void Runtime.runSync(env.runtime)(subscription.unsubscribe())
  }, [selector, equivalence, env.runtime])
  return state
}
