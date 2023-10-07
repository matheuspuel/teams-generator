import { AsyncStorage } from 'src/services/AsyncStorage'
import { Effect, F } from 'src/utils/fp'
import { TelemetryRepositories } from '.'
import { LogRepositoryLive } from './Log/live'

export const TelemetryRepositoriesLive: Effect<
  AsyncStorage,
  never,
  TelemetryRepositories
> = F.all({
  Log: LogRepositoryLive,
})
