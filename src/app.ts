import { Duration, Effect, Stream, SubscriptionRef, pipe } from 'effect'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { setupReceiveURLHandler } from './export/group'
import { runMigrations } from './services/Repositories/migrations'
import { SplashScreen } from './services/SplashScreen'
import { RootState, appStateMachineInstance } from './state'
import { setAppLoaded } from './state/appLoading'

export const startApp = Effect.gen(function* () {
  yield* SplashScreen.preventAutoHide()
  yield* runMigrations.pipe(Effect.ignore)
  yield* hydrate
  const updatesRef = yield* SubscriptionRef.make<RootState | null>(null)
  yield* appStateMachineInstance.subscribe(_ =>
    SubscriptionRef.set(updatesRef, _),
  )
  yield* pipe(
    updatesRef.changes,
    Stream.debounce(Duration.decode('1000 millis')),
    Stream.changes,
    Stream.flatMap(() => saveState()),
    Stream.runDrain,
    Effect.forkDaemon,
  )
  setAppLoaded()
  yield* setupReceiveURLHandler().pipe(
    Stream.tap(_ => appStateMachineInstance.actions.importGroupData(_)),
    Stream.runDrain,
    Effect.forkDaemon,
  )
  yield* Effect.logDebug('startApp done')
})
