/* eslint-disable functional/functional-parameters */
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import { Timestamp } from 'src/utils/datatypes'

export const TelemetryLogSchema = Schema.Struct({
  timestamp: Timestamp.Timestamp,
  event: Schema.String,
  data: Schema.Unknown,
})

export type TelemetryLog = Schema.Schema.Type<typeof TelemetryLogSchema>

export type TelemetryImplementation = {
  log: (logs: Array<TelemetryLog>) => Effect.Effect<void, unknown>
  send: () => Effect.Effect<void, unknown>
}

export class Telemetry extends Effect.Tag('Telemetry')<
  Telemetry,
  TelemetryImplementation
>() {}
