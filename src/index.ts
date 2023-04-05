import { $, IO, R } from 'fp'
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
import { AppEvent, Event, eventHandler } from './actions'
import { Log, LoggerEnv } from './services/Log'
import { defaultLogger } from './services/Log/default'

const logEvent = (event: Event<string, unknown>) =>
  $(Log.debug('Event'), l =>
    event.event.payload === undefined
      ? l(event.event._tag)(null)
      : event.event.payload === null
      ? l(event.event._tag + ': null')(null)
      : typeof event.event.payload === 'object'
      ? l(event.event._tag)(event.event.payload)
      : l(event.event._tag + (': ' + JSON.stringify(event.event.payload)))(
          null,
        ),
  )

const eventHandlerWithLogging =
  (env: R.EnvType<typeof eventHandler> & LoggerEnv) => (event: AppEvent) =>
    $(
      logEvent(event)(env),
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
    logger: defaultLogger,
    stateRef: defaultStateRef,
    splashScreen: defaultSplashScreen,
    backHandler: defaultBackHandler,
    repositories: {
      Groups: defaultGroupsRepository,
      Parameters: defaultParametersRepository,
    },
  }),
})()
