import { Duration, F, Stream, pipe } from 'fp'
import { BackHandler } from 'src/services/BackHandler'
import { StateRef } from 'src/services/StateRef'
import { UI } from 'src/services/UI'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { appLoaded, back } from './events/core'
import { setupReceiveURLHandler } from './export/group'
import { Metadata } from './services/Metadata'
import { runMigrations } from './services/Repositories/migrations'
import { SplashScreen } from './services/SplashScreen'
import { Telemetry } from './services/Telemetry'
import { Timestamp } from './utils/datatypes'

export const startApp = pipe(
  UI.start(),
  F.flatMap(() => SplashScreen.preventAutoHide()),
  F.flatMap(() =>
    pipe(
      BackHandler.stream,
      Stream.tap(() => back()),
      Stream.runDrain,
      F.forkDaemon,
    ),
  ),
  F.tap(() => runMigrations.pipe(F.ignore)),
  F.flatMap(() => hydrate),
  F.tap(() =>
    pipe(
      StateRef.changes,
      Stream.debounce(Duration.decode('1000 millis')),
      Stream.changes,
      Stream.flatMap(() => saveState()),
      Stream.runDrain,
      F.forkDaemon,
    ),
  ),
  F.tap(() => appLoaded()),
  F.tap(() =>
    pipe(
      F.all([Metadata.get(), Timestamp.getNow()]),
      F.flatMap(([m, t]) =>
        Telemetry.log([{ timestamp: t, event: 'start', data: m }]),
      ),
      F.flatMap(() => Telemetry.send()),
      F.catchAll(() => F.unit),
    ),
  ),
  F.tap(() => setupReceiveURLHandler().pipe(Stream.runDrain, F.forkDaemon)),
  F.tap(() => F.logDebug('startApp done')),
)
