/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-conditional-statements */
import * as Fiber from '@effect/io/Fiber'
import { Eq, F, O, Option, Runtime, S, Stream, pipe } from 'fp'
import React from 'react'
import { RootState } from 'src/model'
import { runtime } from 'src/runtime'
import { AppStateRefEnv, changes, execute, getRootState } from '.'
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
  const ref = React.useRef<Option<{ state: A; lastSentState: A }>>(O.none())
  const refresher = React.useState(0)
  const refresh = () => refresher[1](n => (n === 9999 ? 0 : n + 1))
  // eslint-disable-next-line functional/no-let
  let returnValue: A
  if (O.isNone(ref.current)) {
    returnValue = execute(S.gets(selector)).pipe(
      F.provideService(AppStateRefEnv, env.StateRef),
      Runtime.runSync(runtime),
    )
    ref.current = O.some({ state: returnValue, lastSentState: returnValue })
  } else {
    returnValue = ref.current.value.lastSentState
  }
  React.useEffect(() => {
    const fiber = pipe(
      changes,
      Stream.changes,
      Stream.flatMap(() =>
        pipe(
          execute(getRootState),
          F.map(selector),
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
        ),
      ),
      Stream.runDrain,
      F.provideService(AppStateRefEnv, env.StateRef),
      Runtime.runFork(runtime),
    )
    return () => void Runtime.runPromiseExit(runtime)(Fiber.interrupt(fiber))
  }, [selector, env, eq])
  return returnValue
}
