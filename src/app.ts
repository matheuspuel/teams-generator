import { Duration, Effect, Stream, pipe } from 'effect'
import { BackHandler } from 'src/services/BackHandler'
import { StateRef } from 'src/services/StateRef'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { appLoaded, back } from './events/core'
import { setupReceiveURLHandler } from './export/group'
import { runMigrations } from './services/Repositories/migrations'
import { SplashScreen } from './services/SplashScreen'
import { UI } from './services/UI'

export const startApp = pipe(
  UI.start(),
  Effect.flatMap(() => SplashScreen.preventAutoHide()),
  Effect.flatMap(() =>
    pipe(
      BackHandler.stream,
      Stream.tap(() => back),
      Stream.runDrain,
      Effect.forkDaemon,
    ),
  ),
  Effect.tap(() => runMigrations.pipe(Effect.ignore)),
  Effect.flatMap(() => hydrate),
  Effect.tap(() =>
    pipe(
      StateRef.changes,
      Stream.debounce(Duration.decode('1000 millis')),
      Stream.changes,
      Stream.flatMap(() => saveState()),
      Stream.runDrain,
      Effect.forkDaemon,
    ),
  ),
  Effect.tap(() => appLoaded),
  Effect.tap(() =>
    setupReceiveURLHandler().pipe(Stream.runDrain, Effect.forkDaemon),
  ),
  Effect.tap(() => Effect.logDebug('startApp done')),
)
