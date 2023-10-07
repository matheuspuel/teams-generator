import { F, Layer, LogLevel, Logger, Runtime, pipe } from 'fp'
import { Alert } from 'src/services/Alert'
import { BackHandler } from 'src/services/BackHandler'
import { BackHandlerLive } from 'src/services/BackHandler/default'
import { DocumentPicker } from 'src/services/DocumentPicker'
import { FileSystem } from 'src/services/FileSystem'
import { IdGenerator } from 'src/services/IdGenerator'
import { MetadataService } from 'src/services/Metadata'
import { Repositories } from 'src/services/Repositories'
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
import { InstallationRepositoryLive } from './services/Repositories/metadata/installation/default'
import { GroupOrderRepositoryLive } from './services/Repositories/teams/groupOrder/default'
import { GroupsRepositoryLive } from './services/Repositories/teams/groups/default'
import { ParametersRepositoryLive } from './services/Repositories/teams/parameters/default'
import { LogRepositoryLive } from './services/Repositories/telemetry/log/default'
import { SafeAreaService } from './services/SafeArea'
import { SafeAreaServiceLive } from './services/SafeArea/default'
import { ShareServiceLive } from './services/Share/default'
import { TelemetryLive } from './services/Telemetry/default'
import { AppTheme } from './services/Theme'
import { AppThemeLive } from './services/Theme/default'
import { envName } from './utils/Metadata'

const DEV_MINIMUM_LOG_LEVEL = LogLevel.Debug

export type AppRequirements =
  | AppStateRef
  | SplashScreen
  | BackHandler
  | Repositories.metadata.installation
  | Repositories.teams.groupOrder
  | Repositories.teams.groups
  | Repositories.teams.parameters
  | Repositories.telemetry.log
  | Alert
  | DocumentPicker
  | FileSystem
  | IdGenerator
  | MetadataService
  | Telemetry
  | ShareService
  | AppTheme
  | SafeAreaService
  | Linking

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
      InstallationRepositoryLive,
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

export type AppRuntime = Runtime.Runtime<AppRequirements>

export const runtime: AppRuntime = pipe(
  Layer.toRuntime(appLayer),
  F.scoped,
  F.cached,
  F.flatten,
  F.runSync,
)
