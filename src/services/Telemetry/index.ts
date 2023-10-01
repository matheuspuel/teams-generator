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

export type TelemetryLog = S.Schema.To<typeof TelemetryLogSchema>

export type Telemetry = {
  log: (logs: Array<TelemetryLog>) => Effect<never, unknown, void>
  send: () => Effect<never, unknown, void>
}

export const TelemetryEnv = Context.Tag<Telemetry>()

export const Telemetry = F.serviceFunctions(TelemetryEnv)
