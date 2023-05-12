import { $, R, T } from 'fp'
import { startApp } from 'src/App2'
import { defaultBackHandler } from 'src/services/BackHandler/default'
import {
  defaultGroupsRepository,
  defaultParametersRepository,
} from 'src/services/Repositories/default'
import { defaultSplashScreen } from 'src/services/SplashScreen/default'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { defaultUI } from 'src/services/UI/default'
import { AppEvent, Event, makeEventHandler } from './actions'
import { defaultIdGenerator } from './services/IdGenerator/default'
import { Log, LoggerEnv } from './services/Log'
import { defaultLogger } from './services/Log/default'
import { defaultSafeAreaService } from './services/SafeArea/default'
import { defaultShareService } from './services/Share/default'

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
  (env: R.EnvType<typeof makeEventHandler> & LoggerEnv) => (event: AppEvent) =>
    $(
      logEvent(event)(env),
      T.fromIO,
      T.chain(() => async () => await makeEventHandler(env)(event)()),
    )

// eslint-disable-next-line functional/no-expression-statements
void startApp({
  stateRef: defaultStateRef,
  theme: defaultTheme,
  safeArea: defaultSafeAreaService,
  backHandler: defaultBackHandler,
  repositories: {
    Groups: defaultGroupsRepository,
    Parameters: defaultParametersRepository,
  },
  ui: defaultUI,
  eventHandler: eventHandlerWithLogging({
    logger: defaultLogger,
    idGenerator: defaultIdGenerator,
    stateRef: defaultStateRef,
    splashScreen: defaultSplashScreen,
    backHandler: defaultBackHandler,
    share: defaultShareService,
    repositories: {
      Groups: defaultGroupsRepository,
      Parameters: defaultParametersRepository,
    },
  }),
})()
