/* eslint-disable functional/functional-parameters */
import { Schema } from '@effect/schema'
import { Context, Effect } from 'effect'
import { Timestamp } from 'src/utils/datatypes'

export const TelemetryLogSchema = Schema.struct({
  timestamp: Timestamp.Timestamp,
  event: Schema.string,
  data: Schema.unknown,
})

export type TelemetryLog = Schema.Schema.Type<typeof TelemetryLogSchema>

export type Telemetry = {
  log: (logs: Array<TelemetryLog>) => Effect.Effect<void, unknown>
  send: () => Effect.Effect<void, unknown>
}

export class TelemetryEnv extends Context.Tag('Telemetry')<
  TelemetryEnv,
  Telemetry
>() {}

export const Telemetry = Effect.serviceFunctions(TelemetryEnv)
