import * as SplashScreen from 'expo-splash-screen'
import { $, $f, RT } from 'fp'
import throttle from 'lodash.throttle'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { onGoBack } from 'src/slices/routes'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { HardwareBackPressObserver } from './services/BackHandler'
import { execute, replaceSApp, subscribe } from './services/StateRef'
import { LoadedLens } from './slices/core/loading'

export const runStartupTasks = $(
  $(
    RT.fromIO(SplashScreen.preventAutoHideAsync),
    RT.chainReaderIOK(() => $f(onGoBack, HardwareBackPressObserver.subscribe)),
    RT.chain(() => hydrate),
    RT.chainFirstReaderIOKW(() =>
      subscribe($f(saveState, f => throttle(() => f(), $(1000, milliseconds)))),
    ),
  ),
  RT.chainFirstReaderIOKW(() => execute(replaceSApp(LoadedLens)(true))),
)
