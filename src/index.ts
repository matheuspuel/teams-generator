import { startApp } from 'src/App'
import { defaultBackHandler } from 'src/services/BackHandler/default'
import {
  defaultGroupsRepository,
  defaultParametersRepository,
} from 'src/services/Repositories/default'
import { defaultSplashScreen } from 'src/services/SplashScreen/default'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { defaultUI } from 'src/services/UI/default'
import { AppEvent, eventHandler } from './actions'
import { $, Console, IO, R } from './utils/fp'

const eventHandlerWithLogging =
  (env: R.EnvType<typeof eventHandler>) => (event: AppEvent) =>
    $(
      Console.log(
        event.event._tag +
          (event.event.payload === undefined
            ? ''
            : ': ' + JSON.stringify(event.event.payload, undefined, 2)),
      ),
      IO.chain(() => eventHandler(env)(event)),
    )

// eslint-disable-next-line functional/no-expression-statements
void startApp({
  stateRef: defaultStateRef,
  theme: defaultTheme,
  backHandler: defaultBackHandler,
  repositories: {
    Groups: defaultGroupsRepository,
    Parameters: defaultParametersRepository,
  },
  ui: defaultUI,
  eventHandler: eventHandlerWithLogging({
    stateRef: defaultStateRef,
    splashScreen: defaultSplashScreen,
    backHandler: defaultBackHandler,
    repositories: {
      Groups: defaultGroupsRepository,
      Parameters: defaultParametersRepository,
    },
  }),
})()
