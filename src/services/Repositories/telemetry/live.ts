import { Effect } from 'effect'
import { AsyncStorageEnv } from 'src/services/AsyncStorage'
import { TelemetryRepositories } from '.'
import { LogRepositoryLive } from './Log/live'

export const TelemetryRepositoriesLive: Effect.Effect<
  TelemetryRepositories,
  never,
  AsyncStorageEnv
> = Effect.all({
  Log: LogRepositoryLive,
})
