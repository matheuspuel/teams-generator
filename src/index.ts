import { $, F, Layer, pipe } from 'fp'
import { startApp } from 'src/app'
import { Event } from 'src/events/helpers'
import { BackHandlerLive } from 'src/services/BackHandler/default'
import { AppEventHandlerEnv } from 'src/services/EventHandler'
import { SplashScreenLive } from 'src/services/SplashScreen/default'
import { StateRefLive } from 'src/services/StateRef/default'
import { UILive } from 'src/services/UI/default'
import { AppEvent, AppEventHandlerRequirements } from './events'
import { AsyncStorageLive } from './services/AsyncStorage/live'
import { AppEventHandlerLive } from './services/EventHandler/default'
import { IdGeneratorLive } from './services/IdGenerator/default'
import { Log, Logger } from './services/Log'
import { LoggerLive } from './services/Log/default'
import { MetadataServiceLive } from './services/Metadata/default'
import { GroupOrderRepositoryLive } from './services/Repositories/teams/groupOrder/default'
import { GroupsRepositoryLive } from './services/Repositories/teams/groups/default'
import { ParametersRepositoryLive } from './services/Repositories/teams/parameters/default'
import { LogRepositoryLive } from './services/Repositories/telemetry/log/default'
import { SafeAreaServiceLive } from './services/SafeArea/default'
import { ShareServiceLive } from './services/Share/default'
import { TelemetryLive } from './services/Telemetry/default'
import { AppThemeLive } from './services/Theme/default'

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

const AppEventHandlerWithLogger = F.map(
  F.context<Logger | AppEventHandlerRequirements>(),
  ctx =>
    AppEventHandlerEnv.context((e: AppEvent) =>
      $(
        logEvent(e),
        F.flatMap(() => AppEventHandlerEnv.pipe(F.flatMap(h => h(e)))),
        F.provideSomeLayer(AppEventHandlerLive),
        F.provideContext(ctx),
      ),
    ),
).pipe(Layer.effectContext)

const appLayer = pipe(
  AsyncStorageLive,
  Layer.provideMerge(
    Layer.mergeAll(
      LogRepositoryLive,
      GroupsRepositoryLive,
      GroupOrderRepositoryLive,
      ParametersRepositoryLive,
    ),
  ),
  Layer.provideMerge(
    Layer.mergeAll(
      LoggerLive,
      MetadataServiceLive,
      TelemetryLive,
      IdGeneratorLive,
      StateRefLive,
      ShareServiceLive,
      BackHandlerLive,
      SplashScreenLive,
      SafeAreaServiceLive,
      AppThemeLive,
    ),
  ),
  Layer.provideMerge(AppEventHandlerWithLogger),
  Layer.provideMerge(UILive),
)

const program = $(startApp, F.provideLayer(appLayer))

// eslint-disable-next-line functional/no-expression-statements
void F.runPromiseExit(program)
