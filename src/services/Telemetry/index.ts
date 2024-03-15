/* eslint-disable functional/functional-parameters */
import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { Timestamp } from 'src/utils/datatypes'
import { F, S } from 'src/utils/fp'

export const TelemetryLogSchema = S.struct({
  timestamp: Timestamp.Schema,
  event: S.string,
  data: S.unknown,
})

export type TelemetryLog = S.Schema.Type<typeof TelemetryLogSchema>

export type Telemetry = {
  log: (logs: Array<TelemetryLog>) => Effect<void, unknown>
  send: () => Effect<void, unknown>
}

export class TelemetryEnv extends Context.Tag('Telemetry')<
  TelemetryEnv,
  Telemetry
>() {}

export const Telemetry = F.serviceFunctions(TelemetryEnv)
