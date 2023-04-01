import 'react-native-gesture-handler'

import { $, $f, RT } from 'fp'
import throttle from 'lodash.throttle'
import { Element } from 'src/components/custom/types'
import { root } from 'src/model/Optics'
import { BackHandler } from 'src/services/BackHandler'
import { hardwareBackPressObserver } from 'src/services/BackHandler/default'
import {
  defaultGroupsRepository,
  defaultParametersRepository,
} from 'src/services/Repositories/default'
import { SplashScreen } from 'src/services/SplashScreen'
import { defaultSplashScreen } from 'src/services/SplashScreen/default'
import { execute, replaceSApp, subscribe } from 'src/services/StateRef'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { onGoBack } from 'src/slices/routes'
import { milliseconds } from 'src/utils/datatypes/Duration'
import { UI } from 'src/views'

type AppEnv = Parameters<typeof UI>[0]['env'] &
  Parameters<typeof runStartupTasks>[0]

const env: AppEnv = {
  stateRef: defaultStateRef,
  theme: defaultTheme,
  backHandler: hardwareBackPressObserver,
  splashScreen: defaultSplashScreen,
  repositories: {
    Groups: defaultGroupsRepository,
    Parameters: defaultParametersRepository,
  },
}

const runStartupTasks = $(
  SplashScreen.preventAutoHide,
  RT.chainReaderIOKW(() => BackHandler.subscribe(onGoBack)),
  RT.chainW(() => hydrate),
  RT.chainFirstReaderIOKW(() =>
    subscribe($f(saveState, f => throttle(() => f(), $(1000, milliseconds)))),
  ),
  RT.chainFirstReaderIOKW(() => execute(replaceSApp(root.core.loaded.$)(true))),
)

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = (): Element => UI({ env })
