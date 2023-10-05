/* eslint-disable functional/no-expression-statements */
import { Eq, Equal, F, Runtime, flow } from 'fp'
import React from 'react'
import { useRuntime } from 'src/contexts/Runtime'
import { RootState } from 'src/model'
import { AppRuntime } from 'src/runtime'
import { StateRef } from '../services/StateRef'

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
    selector(StateRef.get.pipe(Runtime.runSync(runtime))),
  )
  React.useEffect(() => {
    const subscription = StateRef.react
      .subscribe(
        flow(selector, s =>
          F.sync(() => setState(state => (equivalence(state, s) ? state : s))),
        ),
      )
      .pipe(Runtime.runSync(runtime))
    return () => subscription.unsubscribe().pipe(Runtime.runSync(runtime))
  }, [selector, equivalence, runtime])
  return state
}
