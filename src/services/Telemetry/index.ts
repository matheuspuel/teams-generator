/* eslint-disable functional/functional-parameters */
import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { Timestamp } from 'src/utils/datatypes'
import { D, Eff } from 'src/utils/fp'

export const TelemetryLogSchema = D.struct({
  timestamp: Timestamp.Schema,
  event: D.string,
  data: D.unknown,
})

export type TelemetryLog = D.To<typeof TelemetryLogSchema>

export type Telemetry = {
  log: (logs: Array<TelemetryLog>) => Effect<never, unknown, void>
  send: Effect<never, unknown, void>
}

export type TelemetryEnv = { Telemetry: Telemetry }

export const TelemetryEnv = Context.Tag<TelemetryEnv>()

export const Telemetry = {
  log: (...args: Parameters<Telemetry['log']>) =>
    Eff.flatMap(TelemetryEnv, env => env.Telemetry.log(...args)),
  send: Eff.flatMap(TelemetryEnv, env => env.Telemetry.send),
}
