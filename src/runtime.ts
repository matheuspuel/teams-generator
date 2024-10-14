import { Context, Effect, Layer, LogLevel, Logger, Runtime, pipe } from 'effect'
import { Alert } from 'src/services/Alert'
import { AsyncStorage } from 'src/services/AsyncStorage'
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
import { RepositoryDefault } from './services/Repositories/default'
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
      FileSystem.Default,
      DocumentPicker.Default,
      Linking.Default,
      MetadataService.Default,
      Telemetry.Default,
      IdGenerator.Default,
      Alert.Default,
      ShareService.Default,
      BackHandler.Default,
      SplashScreen.Default,
      SafeAreaService.Default,
    ),
  ),
  Layer.provideMerge(Layer.mergeAll(RepositoryDefault, AppStateRefDefault)),
  Layer.provideMerge(AsyncStorage.Default),
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
