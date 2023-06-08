import { $, Eff, Effect } from 'fp'
import throttle from 'lodash.throttle'
import { BackHandler } from 'src/services/BackHandler'
import * as StateRef from 'src/services/StateRef'
import { UI } from 'src/services/UI'
import { hydrate } from 'src/slices/core/hydration'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { AppEventHandlerEnv, EventHandler, on } from './actions'

export type AppEnv = Effect.Context<typeof startApp>

export const startApp = $(
  UI.start,
  Eff.flatMap(() => EventHandler.handle(on.preventSplashScreenAutoHide)),
  Eff.flatMap(() =>
    Eff.flatMap(AppEventHandlerEnv, env =>
      BackHandler.subscribe(
        Eff.provideService(
          EventHandler.handle(on.goBack),
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
          EventHandler.handle(on.saveState),
          Eff.provideService(AppEventHandlerEnv, env),
          f =>
            Eff.sync(throttle(() => Eff.runPromise(f), $(1000, milliseconds))),
        ),
      ),
    ),
  ),
  Eff.tap(() => EventHandler.handle(on.appLoaded)),
)