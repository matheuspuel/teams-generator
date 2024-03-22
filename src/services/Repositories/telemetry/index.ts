import { Effect } from 'effect'
import { Repository } from '..'
import { LogRepository } from './Log'

export type TelemetryRepositories = {
  Log: LogRepository
}

export const TelemetryRepositories = (Tag: typeof Repository) => ({
  Log: Effect.serviceFunctions(Effect.map(Tag, r => r.telemetry.Log)),
})
