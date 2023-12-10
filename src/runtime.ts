import { Context, F, Layer, LogLevel, Logger, Runtime, pipe } from 'fp'
import { Alert } from 'src/services/Alert'
import { BackHandler } from 'src/services/BackHandler'
import { BackHandlerLive } from 'src/services/BackHandler/default'
import { DocumentPicker } from 'src/services/DocumentPicker'
import { FileSystem } from 'src/services/FileSystem'
import { IdGenerator } from 'src/services/IdGenerator'
import { MetadataService } from 'src/services/Metadata'
import { ShareService } from 'src/services/Share'
import { SplashScreen } from 'src/services/SplashScreen'
import { SplashScreenLive } from 'src/services/SplashScreen/default'
import { AppStateRef } from 'src/services/StateRef'
import { StateRefLive } from 'src/services/StateRef/default'
import { Telemetry } from 'src/services/Telemetry'
import { AlertLive } from './services/Alert/default'
import { AsyncStorageLive } from './services/AsyncStorage/live'
import { DocumentPickerLive } from './services/DocumentPicker/default'
import { FileSystemLive } from './services/FileSystem/default'
import { IdGeneratorLive } from './services/IdGenerator/default'
import { Linking } from './services/Linking'
import { LinkingLive } from './services/Linking/default'
import { MetadataServiceLive } from './services/Metadata/default'
import { Repository } from './services/Repositories'
import { RepositoryLive } from './services/Repositories/live'
import { SafeAreaService } from './services/SafeArea'
import { SafeAreaServiceLive } from './services/SafeArea/default'
import { ShareServiceLive } from './services/Share/default'
import { TelemetryLive } from './services/Telemetry/default'
import { envName } from './utils/Metadata'

const DEV_MINIMUM_LOG_LEVEL = LogLevel.Debug

export type AppRequirements =
  | AppStateRef
  | SplashScreen
  | BackHandler
  | Repository
  | Alert
  | DocumentPicker
  | FileSystem
  | IdGenerator
  | MetadataService
  | Telemetry
  | ShareService
  | SafeAreaService
  | Linking

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
