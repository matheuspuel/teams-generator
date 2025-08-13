import { Context, Effect, Layer, LogLevel, Logger, Runtime, pipe } from 'effect'
import { Alert } from 'src/services/Alert'
import { BackHandler } from 'src/services/BackHandler'
import { DocumentPicker } from 'src/services/DocumentPicker'
import { FileSystem } from 'src/services/FileSystem'
import { IdGenerator } from 'src/services/IdGenerator'
import { Linking } from 'src/services/Linking'
import { MetadataService } from 'src/services/Metadata'
import { Repository } from 'src/services/Repositories'
import { SafeAreaService } from 'src/services/SafeArea'
import { ShareService } from 'src/services/Share'
import { SplashScreen } from 'src/services/SplashScreen'
import { AppStateRef } from 'src/services/StateRef'
import { Telemetry } from 'src/services/Telemetry'
import { envName } from 'src/utils/Metadata'
import { AsyncStorageDefault } from './services/AsyncStorage/default'
import { BackHandlerDefault } from './services/BackHandler/default'
import { DocumentPickerDefault } from './services/DocumentPicker/default'
import { FileSystemDefault } from './services/FileSystem/default'
import { LinkingDefault } from './services/Linking/default'
import { MetadataServiceDefault } from './services/Metadata/default'
import { RepositoryDefault } from './services/Repositories/default'
import { ShareServiceDefault } from './services/Share/default'
import { SplashScreenDefault } from './services/SplashScreen/default'
import { AppStateRefDefault } from './services/StateRef/default'

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
      FileSystemDefault,
      DocumentPickerDefault,
      LinkingDefault,
      MetadataServiceDefault,
      Telemetry.Default,
      IdGenerator.Default,
      Alert.Default,
      ShareServiceDefault,
      BackHandlerDefault,
      SplashScreenDefault,
      SafeAreaService.Default,
    ),
  ),
  Layer.provideMerge(Layer.mergeAll(RepositoryDefault, AppStateRefDefault)),
  Layer.provideMerge(AsyncStorageDefault),
  Layer.provideMerge(
    Logger.minimumLogLevel(
      envName === 'development' ? DEV_MINIMUM_LOG_LEVEL : LogLevel.Info,
    ),
  ),
)

export type AppRuntime = Runtime.Runtime<AppRequirements>

export const runtime: AppRuntime = pipe(
  Layer.toRuntime(appLayer),
  Effect.scoped,
  Effect.cached,
  Effect.flatten,
  Effect.runSync,
)

export type AppEvent = Effect.Effect<unknown, never, AppRequirements>
