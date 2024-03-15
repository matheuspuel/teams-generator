import { Context, F, Layer, LogLevel, Logger, Runtime, pipe } from 'fp'
import { AlertEnv } from 'src/services/Alert'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { BackHandlerLive } from 'src/services/BackHandler/default'
import { DocumentPickerEnv } from 'src/services/DocumentPicker'
import { FileSystemEnv } from 'src/services/FileSystem'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
import { MetadataServiceEnv } from 'src/services/Metadata'
import { ShareServiceEnv } from 'src/services/Share'
import { SplashScreenEnv } from 'src/services/SplashScreen'
import { SplashScreenLive } from 'src/services/SplashScreen/default'
import { AppStateRefEnv } from 'src/services/StateRef'
import { StateRefLive } from 'src/services/StateRef/default'
import { TelemetryEnv } from 'src/services/Telemetry'
import { AlertLive } from './services/Alert/default'
import { AsyncStorageLive } from './services/AsyncStorage/live'
import { DocumentPickerLive } from './services/DocumentPicker/default'
import { FileSystemLive } from './services/FileSystem/default'
import { IdGeneratorLive } from './services/IdGenerator/default'
import { LinkingEnv } from './services/Linking'
import { LinkingLive } from './services/Linking/default'
import { MetadataServiceLive } from './services/Metadata/default'
import { RepositoryLive } from './services/Repositories/live'
import { RepositoryEnv } from './services/Repositories/tag'
import { SafeAreaServiceEnv } from './services/SafeArea'
import { SafeAreaServiceLive } from './services/SafeArea/default'
import { ShareServiceLive } from './services/Share/default'
import { TelemetryLive } from './services/Telemetry/default'
import { envName } from './utils/Metadata'

const DEV_MINIMUM_LOG_LEVEL = LogLevel.Debug

export type AppRequirements =
  | AppStateRefEnv
  | SplashScreenEnv
  | BackHandlerEnv
  | RepositoryEnv
  | AlertEnv
  | DocumentPickerEnv
  | FileSystemEnv
  | IdGeneratorEnv
  | MetadataServiceEnv
  | TelemetryEnv
  | ShareServiceEnv
  | SafeAreaServiceEnv
  | LinkingEnv

const appLayer = pipe(
  Layer.succeedContext(Context.empty()),
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
    ),
  ),
  Layer.provideMerge(Layer.mergeAll(RepositoryLive, StateRefLive)),
  Layer.provideMerge(AsyncStorageLive),
  Layer.provideMerge(
    Logger.minimumLogLevel(
      envName === 'development' ? DEV_MINIMUM_LOG_LEVEL : LogLevel.Info,
    ),
  ),
)

export type AppRuntime = Runtime.Runtime<AppRequirements>

export const runtime: AppRuntime = pipe(
  Layer.toRuntime(appLayer),
  F.scoped,
  F.cached,
  F.flatten,
  F.runSync,
)
