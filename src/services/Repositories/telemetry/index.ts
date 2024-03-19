import { Effect } from 'effect'
import { RepositoryEnv } from '../tag'
import { LogRepository } from './Log'

export type TelemetryRepositories = {
  Log: LogRepository
}

export const TelemetryRepositories = {
  Log: {
    get: Effect.serviceFunctionEffect(RepositoryEnv, r => r.telemetry.Log.get),
    concat: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.telemetry.Log.concat,
    ),
    clear: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.telemetry.Log.clear,
    ),
  },
}
