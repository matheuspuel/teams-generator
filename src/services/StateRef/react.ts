/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-conditional-statements */
import { $, Eq, F, O, Option, S } from 'fp'
import React from 'react'
import { RootState } from 'src/model'
import { execute, subscribe } from '.'
import { UIEnv } from '../UI'
import { StateRefLive } from './default'

export const useSelector = <A>({
  selector,
  eq,
  env,
}: {
  selector: (state: RootState) => A
  eq: Eq.Equivalence<A>
  env: UIEnv
}): A => {
  const ref = React.useRef<Option<{ state: A; lastSentState: A }>>(O.none())
  const refresher = React.useState(0)
  const refresh = () => refresher[1](n => (n === 9999 ? 0 : n + 1))
  // eslint-disable-next-line functional/no-let
  let returnValue: A
  if (O.isNone(ref.current)) {
    returnValue = execute(S.gets(selector)).pipe(
      F.provideLayer(StateRefLive),
      F.runSync,
    )
    ref.current = O.some({ state: returnValue, lastSentState: returnValue })
  } else {
    returnValue = ref.current.value.lastSentState
  }
  React.useEffect(() => {
    const subscription = $(
      execute(S.gets(selector)),
      F.flatMap(s =>
        F.sync(() => {
          if (
            O.isSome(ref.current) &&
            Eq.equals(eq)(s)(ref.current.value.lastSentState)
          ) {
            ref.current = O.some({
              state: s,
              lastSentState: ref.current.value.lastSentState,
            })
          } else {
            ref.current = O.some({ state: s, lastSentState: s })
            refresh()
          }
        }),
      ),
      F.provideLayer(StateRefLive),
      subscribe,
      F.provideLayer(StateRefLive),
      F.runSync,
    )
    return () => F.runSync(subscription.unsubscribe)
  }, [selector, env, eq])
  return returnValue
}
