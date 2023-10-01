import { F, Layer, LogLevel, Logger, pipe } from 'fp'
import { BackHandlerLive } from 'src/services/BackHandler/default'
import { SplashScreenLive } from 'src/services/SplashScreen/default'
import { StateRefLive } from 'src/services/StateRef/default'
import { AlertLive } from './services/Alert/default'
import { AsyncStorageLive } from './services/AsyncStorage/live'
import { DocumentPickerLive } from './services/DocumentPicker/default'
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
      StateRefLive,
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
      AlertLive,
      ShareServiceLive,
      BackHandlerLive,
      SplashScreenLive,
      SafeAreaServiceLive,
      AppThemeLive,
    ),
  ),
)

export type AppRuntime = typeof runtime

export const runtime = pipe(
  Layer.toRuntime(appLayer),
  F.scoped,
  F.cached,
  F.flatten,
  F.runSync,
)
