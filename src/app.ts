import { $, $f, R, RT } from 'fp'
import throttle from 'lodash.throttle'
import { BackHandler } from 'src/services/BackHandler'
import * as StateRef from 'src/services/StateRef'
import { UI } from 'src/services/UI'
import { hydrate } from 'src/slices/core/hydration'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { EventHandler, on } from './actions'

export type AppEnv<R1> = R.EnvType<ReturnType<typeof startApp_<R1>>>

const startApp_ = <R>() =>
  $(
    RT.fromReaderIO((void 0, UI.start)<R>),
    RT.chainReaderIOKW(() =>
      EventHandler.handle(on.preventSplashScreenAutoHide),
    ),
    RT.chainReaderIOKW(() =>
      BackHandler.subscribe(EventHandler.handle(on.goBack)),
    ),
    RT.chainW(() => hydrate),
    RT.chainFirstReaderIOKW(() =>
      StateRef.subscribe(
        $f(EventHandler.handle(on.saveState), f =>
          throttle(() => f(), $(1000, milliseconds)),
        ),
      ),
    ),
    RT.chainFirstReaderIOKW(() => EventHandler.handle(on.appLoaded)),
  )

export const startApp = <R>(env: AppEnv<R>) => startApp_<R>()(env)
