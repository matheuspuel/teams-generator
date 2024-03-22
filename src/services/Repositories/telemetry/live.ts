import { Effect } from 'effect'
import { AsyncStorage } from 'src/services/AsyncStorage'
import { TelemetryRepositories } from '.'
import { LogRepositoryLive } from './Log/live'

export const TelemetryRepositoriesLive: Effect.Effect<
  TelemetryRepositories,
  never,
  AsyncStorage
> = Effect.all({
  Log: LogRepositoryLive,
})
