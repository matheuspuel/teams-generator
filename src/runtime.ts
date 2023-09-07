import { $, F, Layer, LogLevel, Logger, pipe } from 'fp'
import { Event } from 'src/events/helpers'
import { BackHandlerLive } from 'src/services/BackHandler/default'
import { AppEventHandlerEnv } from 'src/services/EventHandler'
import { SplashScreenLive } from 'src/services/SplashScreen/default'
import { StateRefLive } from 'src/services/StateRef/default'
import { AppEvent } from './events'
import { AsyncStorageLive } from './services/AsyncStorage/live'
import { DocumentPickerLive } from './services/DocumentPicker/default'
import { AppEventHandlerLive } from './services/EventHandler/default'
import { FileSystemLive } from './services/FileSystem/default'
import { IdGeneratorLive } from './services/IdGenerator/default'
import { LinkingLive } from './services/Linking/default'
import { MetadataServiceLive } from './services/Metadata/default'
import { GroupOrderRepositoryLive } from './services/Repositories/teams/groupOrder/default'
import { GroupsRepositoryLive } from './services/Repositories/teams/groups/default'
import { ParametersRepositoryLive } from './services/Repositories/teams/parameters/default'
import { LogRepositoryLive } from './services/Repositories/telemetry/log/default'
import { SafeAreaServiceLive } from './services/SafeArea/default'
import { ShareServiceLive } from './services/Share/default'
import { TelemetryLive } from './services/Telemetry/default'
import { AppThemeLive } from './services/Theme/default'
import { envName } from './utils/Metadata'

const DEV_MINIMUM_LOG_LEVEL = LogLevel.Debug

const logEvent = (event: Event) =>
  $(
    F.logDebug,
    l =>
      event.event.payload === undefined
        ? l(event.event._tag)
        : event.event.payload === null
        ? l(event.event._tag + ': null')
        : typeof event.event.payload === 'object'
        ? l(event.event._tag + (': ' + JSON.stringify(event.event.payload)))
        : l(event.event._tag + (': ' + JSON.stringify(event.event.payload))),
    F.withLogSpan('Event'),
  )

const AppEventHandlerWithLogger = F.map(AppEventHandlerEnv, handler =>
  AppEventHandlerEnv.context({
    handle: (e: AppEvent) =>
      pipe(
        logEvent(e),
        F.flatMap(() => handler.handle(e)),
      ),
  }),
).pipe(F.provideLayer(AppEventHandlerLive), Layer.effectContext)

const appLayer = pipe(
  Logger.minimumLogLevel(
    envName === 'development' ? DEV_MINIMUM_LOG_LEVEL : LogLevel.Info,
  ),
  Layer.provideMerge(AsyncStorageLive),
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
      FileSystemLive,
      DocumentPickerLive,
      LinkingLive,
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
)

export const runtime = pipe(
  Layer.toRuntime(appLayer),
  F.scoped,
  F.cached,
  F.flatten,
  F.runSync,
)
