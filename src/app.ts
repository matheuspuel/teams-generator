import { $, Eff, Effect } from 'fp'
import throttle from 'lodash.throttle'
import { AppEventHandlerEnv, EventHandler } from 'src/events/handler'
import { appEvents } from 'src/events/index'
import { BackHandler } from 'src/services/BackHandler'
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
  Eff.flatMap(() => EventHandler.handle(on.preventSplashScreenAutoHide())),
  Eff.flatMap(() =>
    Eff.flatMap(AppEventHandlerEnv, env =>
      BackHandler.subscribe(
        Eff.provideService(
          EventHandler.handle(appEvents.back()),
          AppEventHandlerEnv,
          env,
        ),
      ),
    ),
  ),
  Eff.flatMap(() => hydrate),
  Eff.tap(() =>
    Eff.flatMap(AppEventHandlerEnv, env =>
      StateRef.subscribe(
        $(
          EventHandler.handle(on.saveState()),
          Eff.provideService(AppEventHandlerEnv, env),
          f =>
            Eff.sync(throttle(() => Eff.runPromise(f), $(1000, milliseconds))),
        ),
      ),
    ),
  ),
  Eff.tap(() => EventHandler.handle(on.appLoaded())),
  Eff.flatMap(() => Eff.all(Metadata.get, Timestamp.getNow)),
  Eff.flatMap(([m, t]) =>
    Telemetry.log([{ timestamp: t, event: 'start', data: m }]),
  ),
  Eff.flatMap(() => Telemetry.send),
)
