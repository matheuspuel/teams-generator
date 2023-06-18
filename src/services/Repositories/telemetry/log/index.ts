import { Effect } from 'fp'
import { TelemetryLog } from 'src/services/Telemetry'

export type log = {
  get: Effect<never, unknown, ReadonlyArray<TelemetryLog>>
  concat: (value: ReadonlyArray<TelemetryLog>) => Effect<never, unknown, void>
  clear: Effect<never, unknown, void>
}