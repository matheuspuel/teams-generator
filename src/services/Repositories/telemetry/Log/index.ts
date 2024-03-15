import { Effect } from 'fp'
import { TelemetryLog } from 'src/services/Telemetry'

export type LogRepository = {
  get: () => Effect<ReadonlyArray<TelemetryLog>, unknown>
  concat: (value: ReadonlyArray<TelemetryLog>) => Effect<void, unknown>
  clear: () => Effect<void, unknown>
}
