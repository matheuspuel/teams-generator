/* eslint-disable functional/no-expression-statements */
import { Eq, F, Runtime, pipe } from 'fp'
import React from 'react'
import { RootState } from 'src/model'
import { StateRef } from '.'
import { UIEnv } from '../UI'

export const useSelector = <A>({
  selector,
  eq,
  env,
}: {
  selector: (state: RootState) => A
  eq: Eq.Equivalence<A>
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
            setState(state => (eq(s, state) ? state : s))
          }),
        ),
      ),
      Runtime.runSync(env.runtime),
    )
    return () => void Runtime.runSync(env.runtime)(subscription.unsubscribe())
  }, [selector, eq, env.runtime])
  return state
}
