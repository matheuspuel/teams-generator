import { type FileSystem, Path } from '@effect/platform'
import { Layer, LogLevel, Logger, ManagedRuntime, pipe } from 'effect'
import { Alert } from 'src/services/Alert'
import type { DocumentPicker } from 'src/services/DocumentPicker'
import { IdGenerator } from 'src/services/IdGenerator'
import type { Linking } from 'src/services/Linking'
import type { Repository } from 'src/services/Repositories'
import { SafeAreaService } from 'src/services/SafeArea'
import type { ShareService } from 'src/services/Share'
import type { SplashScreen } from 'src/services/SplashScreen'
import { envName } from 'src/utils/Metadata'
import { AsyncStorageDefault } from './services/AsyncStorage/default'
import { DocumentPickerDefault } from './services/DocumentPicker/default'
import { FileSystemExpo } from './services/FileSystem/expo'
import { LinkingDefault } from './services/Linking/default'
import { RepositoryDefault } from './services/Repositories/default'
import { ShareServiceDefault } from './services/Share/default'
import { SplashScreenDefault } from './services/SplashScreen/default'

const DEV_MINIMUM_LOG_LEVEL = LogLevel.Debug

export type AppRequirements =
  | SplashScreen
  | Repository
  | Alert
  | DocumentPicker
  | FileSystem.FileSystem
  | Path.Path
  | IdGenerator
  | ShareService
  | SafeAreaService
  | Linking

const appLayer = pipe(
  Layer.empty,
  Layer.provideMerge(
    Layer.mergeAll(
      FileSystemExpo,
      Path.layer,
      DocumentPickerDefault,
      LinkingDefault,
      IdGenerator.Default,
      Alert.Default,
      ShareServiceDefault,
      SplashScreenDefault,
      SafeAreaService.Default,
    ),
  ),
  Layer.provideMerge(RepositoryDefault),
  Layer.provideMerge(AsyncStorageDefault),
  Layer.provideMerge(
    Logger.minimumLogLevel(
      envName === 'development' ? DEV_MINIMUM_LOG_LEVEL : LogLevel.Info,
    ),
  ),
)

export type AppRuntime = typeof runtime
export const runtime = ManagedRuntime.make(appLayer)
