import 'react-native-gesture-handler'

import * as SplashScreen from 'expo-splash-screen'
import { $, $f, RT } from 'fp'
import throttle from 'lodash.throttle'
import { Element } from 'src/components/custom/types'
import { AppEnv } from 'src/services'
import { HardwareBackPressObserver } from 'src/services/BackHandler'
import { execute, replaceSApp, subscribe } from 'src/services/StateRef'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { LoadedLens } from 'src/slices/core/loading'
import { onGoBack } from 'src/slices/routes'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { UI } from 'src/views'

const runStartupTasks = $(
  RT.fromIO(SplashScreen.preventAutoHideAsync),
  RT.chainReaderIOK(() => $f(onGoBack, HardwareBackPressObserver.subscribe)),
  RT.chain(() => hydrate),
  RT.chainFirstReaderIOKW(() =>
    subscribe($f(saveState, f => throttle(() => f(), $(1000, milliseconds)))),
  ),
  RT.chainFirstReaderIOKW(() => execute(replaceSApp(LoadedLens)(true))),
)

const env: AppEnv = { stateRef: defaultStateRef, theme: defaultTheme }

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = (): Element => UI({ env })
