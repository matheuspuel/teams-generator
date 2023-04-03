import { startApp } from 'src/App'
import { hardwareBackPressObserver } from 'src/services/BackHandler/default'
import {
  defaultGroupsRepository,
  defaultParametersRepository,
} from 'src/services/Repositories/default'
import { defaultSplashScreen } from 'src/services/SplashScreen/default'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { defaultUI } from 'src/services/UI/default'

// eslint-disable-next-line functional/no-expression-statements
void startApp({
  stateRef: defaultStateRef,
  theme: defaultTheme,
  backHandler: hardwareBackPressObserver,
  splashScreen: defaultSplashScreen,
  repositories: {
    Groups: defaultGroupsRepository,
    Parameters: defaultParametersRepository,
  },
  ui: defaultUI,
})()
