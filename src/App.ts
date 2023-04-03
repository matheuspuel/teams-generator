import { $, $f, R, RT } from 'fp'
import throttle from 'lodash.throttle'
import { root } from 'src/model/Optics'
import { BackHandler } from 'src/services/BackHandler'
import { execute, replaceSApp, subscribe } from 'src/services/StateRef'
import { UI } from 'src/services/UI'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { onGoBack } from 'src/slices/routes'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { SplashScreen } from './services/SplashScreen'

export type AppEnv<R1> = R.EnvType<ReturnType<typeof startApp_<R1>>>

const startApp_ = <R>() =>
  $(
    RT.fromReaderIO((void 0, UI.start)<R>),
    RT.chainW(() => SplashScreen.preventAutoHide),
    RT.chainReaderIOKW(() => BackHandler.subscribe(onGoBack)),
    RT.chainW(() => hydrate),
    RT.chainFirstReaderIOKW(() =>
      subscribe($f(saveState, f => throttle(() => f(), $(1000, milliseconds)))),
    ),
    RT.chainFirstReaderIOKW(() =>
      execute(replaceSApp(root.core.loaded.$)(true)),
    ),
  )

export const startApp = <R>(env: AppEnv<R>) => startApp_<R>()(env)
