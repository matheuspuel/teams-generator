import { $, Effect, F } from 'fp'
import throttle from 'lodash.throttle'
import { appEvents } from 'src/events'
import { BackHandler } from 'src/services/BackHandler'
import { AppEventHandler, AppEventHandlerEnv } from 'src/services/EventHandler'
import * as StateRef from 'src/services/StateRef'
import { UI } from 'src/services/UI'
import { hydrate } from 'src/slices/core/hydration'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { Metadata } from './services/Metadata'
import { Telemetry } from './services/Telemetry'
import { Timestamp } from './utils/datatypes'

export type AppEnv = Effect.Context<typeof startApp>

const on = appEvents.core

export const startApp = $(
  UI.start,
  F.flatMap(() => AppEventHandler.handle(on.preventSplashScreenAutoHide())),
  F.flatMap(() =>
    F.flatMap(F.context<AppEventHandler>(), ctx =>
      BackHandler.subscribe(
        AppEventHandler.handle(appEvents.back()).pipe(F.provideContext(ctx)),
      ),
    ),
  ),
  F.flatMap(() => hydrate),
  F.tap(() =>
    F.flatMap(AppEventHandlerEnv, env =>
      StateRef.subscribe(
        $(
          AppEventHandler.handle(on.saveState()),
          F.provideService(AppEventHandlerEnv, env),
          f => F.sync(throttle(() => F.runPromise(f), $(1000, milliseconds))),
        ),
      ),
    ),
  ),
  F.tap(() => AppEventHandler.handle(on.appLoaded())),
  F.tap(() =>
    $(
      F.all([Metadata.get, Timestamp.getNow()]),
      F.flatMap(([m, t]) =>
        Telemetry.log([{ timestamp: t, event: 'start', data: m }]),
      ),
      F.flatMap(() => Telemetry.send),
      F.catchAll(() => F.unit),
    ),
  ),
)
