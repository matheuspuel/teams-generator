import { $, Eff } from 'fp'
import { startApp } from 'src/app'
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
import { AppEvent, AppEventHandlerEnv, Event, appEventHandler } from './actions'
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
      Eff.all(
        SplashScreenEnv,
        AppStateRefEnv,
        GroupsRepositoryEnv,
        ParametersRepositoryEnv,
        GroupOrderRepositoryEnv,
        BackHandlerEnv,
        IdGeneratorEnv,
        ShareServiceEnv,
        LoggerEnv,
      ),
      envs =>
        Eff.provideService(f, AppEventHandlerEnv, {
          eventHandler: (e: AppEvent) =>
            $(
              logEvent(e),
              Eff.flatMap(() => appEventHandler(e)),
              Eff.provideService(SplashScreenEnv, envs[0]),
              Eff.provideService(AppStateRefEnv, envs[1]),
              Eff.provideService(GroupsRepositoryEnv, envs[2]),
              Eff.provideService(ParametersRepositoryEnv, envs[3]),
              Eff.provideService(GroupOrderRepositoryEnv, envs[4]),
              Eff.provideService(BackHandlerEnv, envs[5]),
              Eff.provideService(IdGeneratorEnv, envs[6]),
              Eff.provideService(ShareServiceEnv, envs[7]),
              Eff.provideService(LoggerEnv, envs[8]),
            ),
        }),
    ),
  Eff.provideService(AppStateRefEnv, { stateRef: defaultStateRef }),
  Eff.provideService(BackHandlerEnv, { backHandler: defaultBackHandler }),
  Eff.provideService(SplashScreenEnv, { splashScreen: defaultSplashScreen }),
  Eff.provideService(IdGeneratorEnv, { idGenerator: defaultIdGenerator }),
  Eff.provideService(ShareServiceEnv, { share: defaultShareService }),
  Eff.provideService(LoggerEnv, { logger: defaultLogger }),
  Eff.provideService(GroupsRepositoryEnv, {
    repositories: { Groups: defaultGroupsRepository },
  }),
  Eff.provideService(GroupOrderRepositoryEnv, {
    repositories: { GroupOrder: defaultGroupOrderRepository },
  }),
  Eff.provideService(ParametersRepositoryEnv, {
    repositories: { Parameters: defaultParametersRepository },
  }),
)

// eslint-disable-next-line functional/no-expression-statements
void Eff.runPromise(program)
