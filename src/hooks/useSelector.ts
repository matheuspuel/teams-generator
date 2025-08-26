import { Effect, Equal, Equivalence, Runtime } from 'effect'
import { useRuntime } from 'src/contexts/Runtime'
import { RootState } from 'src/model'
import { AppRuntime } from 'src/runtime'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
import { StateRef } from '../services/StateRef'

export const useSelector = <A>(
  selector: (state: RootState) => A,
  equivalence?: Equivalence.Equivalence<A>,
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
  equivalence: Equivalence.Equivalence<A>
  runtime: AppRuntime
}) =>
  useSyncExternalStoreWithSelector<RootState, A>(
    onChange => {
      const subscription = StateRef.react
        .subscribe(() => Effect.sync(onChange))
        .pipe(Runtime.runSync(runtime))
      return () => subscription.unsubscribe().pipe(Runtime.runSync(runtime))
    },
    () => StateRef.get.pipe(Runtime.runSync(runtime)),
    undefined,
    selector,
    equivalence,
  )
