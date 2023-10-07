import { F } from 'src/utils/fp'
import { RepositoryEnv } from '../tag'
import { LogRepository } from './Log'

export type TelemetryRepositories = {
  Log: LogRepository
}

export const TelemetryRepositories = {
  Log: {
    get: F.serviceFunctionEffect(RepositoryEnv, r => r.telemetry.Log.get),
    concat: F.serviceFunctionEffect(RepositoryEnv, r => r.telemetry.Log.concat),
    clear: F.serviceFunctionEffect(RepositoryEnv, r => r.telemetry.Log.clear),
  },
}
