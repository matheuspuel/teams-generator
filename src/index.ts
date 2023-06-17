import { $, $f, Context, Eff, Effect } from 'fp'
import { startApp } from 'src/app'
import { AppEventHandlerEnv, appEventHandler } from 'src/events/handler'
import { Event } from 'src/events/helpers'
import { defaultBackHandler } from 'src/services/BackHandler/default'
import {
  defaultGroupOrderRepository,
  defaultGroupsRepository,
  defaultParametersRepository,
} from 'src/services/Repositories/default'
import { defaultSplashScreen } from 'src/services/SplashScreen/default'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { defaultUI } from 'src/services/UI/default'
import { AppEvent } from './events'
import { BackHandlerEnv } from './services/BackHandler'
import { IdGeneratorEnv } from './services/IdGenerator'
import { defaultIdGenerator } from './services/IdGenerator/default'
import { Log, LoggerEnv } from './services/Log'
import { defaultLogger } from './services/Log/default'
import {
  GroupOrderRepositoryEnv,
  GroupsRepositoryEnv,
  ParametersRepositoryEnv,
} from './services/Repositories'
import { defaultSafeAreaService } from './services/SafeArea/default'
import { ShareServiceEnv } from './services/Share'
import { defaultShareService } from './services/Share/default'
import { SplashScreenEnv } from './services/SplashScreen'
import { AppStateRefEnv } from './services/StateRef'
import { UIEnv } from './services/UI'

const logEvent = (event: Event) =>
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

const eventHandler = (e: AppEvent) =>
  $(
    logEvent(e),
    Eff.flatMap(() => appEventHandler(e)),
  )

const program = $(
  startApp,
  f =>
    Eff.flatMap(
      Eff.all(AppEventHandlerEnv, AppStateRefEnv),
      ([{ eventHandler }, { stateRef }]) =>
        Eff.provideService(f, UIEnv, {
          ui: defaultUI({
            theme: defaultTheme,
            safeArea: defaultSafeAreaService,
            eventHandler,
            stateRef,
          }),
        }),
    ),
  f =>
    Eff.flatMap(
      Eff.context<Effect.Context<ReturnType<typeof eventHandler>>>(),
      env =>
        Eff.provideService(f, AppEventHandlerEnv, {
          eventHandler: $f(eventHandler, Eff.provideContext(env)),
        }),
    ),
  Eff.provideContext(
    Context.mergedContext(
      AppStateRefEnv,
      BackHandlerEnv,
      SplashScreenEnv,
      IdGeneratorEnv,
      ShareServiceEnv,
      LoggerEnv,
      GroupsRepositoryEnv,
      GroupOrderRepositoryEnv,
      ParametersRepositoryEnv,
    )({
      stateRef: defaultStateRef,
      backHandler: defaultBackHandler,
      splashScreen: defaultSplashScreen,
      idGenerator: defaultIdGenerator,
      share: defaultShareService,
      logger: defaultLogger,
      repositories: {
        Groups: defaultGroupsRepository,
        GroupOrder: defaultGroupOrderRepository,
        Parameters: defaultParametersRepository,
      },
    }),
  ),
)

// eslint-disable-next-line functional/no-expression-statements
void Eff.runPromise(program)
