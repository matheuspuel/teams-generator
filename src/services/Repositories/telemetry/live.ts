import { AsyncStorageEnv } from 'src/services/AsyncStorage'
import { Effect, F } from 'src/utils/fp'
import { TelemetryRepositories } from '.'
import { LogRepositoryLive } from './Log/live'

export const TelemetryRepositoriesLive: Effect<
  TelemetryRepositories,
  never,
  AsyncStorageEnv
> = F.all({
  Log: LogRepositoryLive,
})
