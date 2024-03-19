import { Effect } from 'effect'
import { TelemetryLog } from 'src/services/Telemetry'

export type LogRepository = {
  get: () => Effect.Effect<ReadonlyArray<TelemetryLog>, unknown>
  concat: (value: ReadonlyArray<TelemetryLog>) => Effect.Effect<void, unknown>
  clear: () => Effect.Effect<void, unknown>
}
