import * as SplashScreen from 'expo-splash-screen'
import { $, $f, replace, RT } from 'fp'
import throttle from 'lodash.throttle'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { onGoBack } from 'src/slices/routes'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { HardwareBackPressObserver } from './services/BackHandler'
import { AppStoreEnv, dispatch } from './services/Store'
import { LoadedLens } from './slices/core/loading'

export const runStartupTasks = $(
  $(
    RT.fromIO(SplashScreen.preventAutoHideAsync),
    RT.chainReaderIOK(() => $f(onGoBack, HardwareBackPressObserver.subscribe)),
    RT.chain(() => hydrate),
    RT.chainFirstReaderIOKW(
      () => (env: AppStoreEnv) => () =>
        env.store.subscribe(
          throttle(() => void saveState(env)(), $(1000, milliseconds)),
        ),
    ),
  ),
  RT.chainFirstReaderIOKW(() => dispatch(replace(LoadedLens)(true))),
)
