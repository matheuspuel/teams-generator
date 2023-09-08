import { $, Duration, Effect, F, Stream, pipe } from 'fp'
import { appEvents } from 'src/events'
import { BackHandler } from 'src/services/BackHandler'
import { StateRef } from 'src/services/StateRef'
import { UI } from 'src/services/UI'
import { hydrate } from 'src/slices/core/hydration'
import { setupReceiveURLHandler } from './export/group'
import { Metadata } from './services/Metadata'
import { Telemetry } from './services/Telemetry'
import { Timestamp } from './utils/datatypes'

export type AppEnv = Effect.Context<typeof startApp>

const on = appEvents.core

export const startApp = $(
  UI.start(),
  F.flatMap(() => on.preventSplashScreenAutoHide()),
  F.flatMap(() =>
    pipe(
      BackHandler.stream,
      Stream.tap(() => appEvents.back()),
      Stream.runDrain,
      F.forkDaemon,
    ),
  ),
  F.flatMap(() => hydrate),
  F.tap(() =>
    pipe(
      StateRef.changes,
      Stream.debounce(Duration.decode('1000 millis')),
      Stream.changes,
      Stream.flatMap(() => on.saveState()),
      Stream.runDrain,
      F.forkDaemon,
    ),
  ),
  F.tap(() => on.appLoaded()),
  F.tap(() =>
    $(
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
