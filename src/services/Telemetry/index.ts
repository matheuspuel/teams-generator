import { Schema } from '@effect/schema'
import { Effect, flow, pipe } from 'effect'
import { Timestamp } from 'src/utils/datatypes'
import * as Fetch from 'src/utils/Fetch'
import * as Metadata from 'src/utils/Metadata'
import { Repository } from '../Repositories'

const telemetryServerUrl = Metadata.matchEnv({
  production: 'https://telemetry-production.up.railway.app',
  staging: 'http://192.168.3.2:8080',
  preview: 'http://192.168.3.2:8080',
  development: 'http://192.168.3.2:8080',
})

export class Telemetry extends Effect.Service<Telemetry>()('Telemetry', {
  accessors: true,
  effect: Effect.map(Effect.context<Repository>(), ctx => ({
    log: flow(Repository.telemetry.Log.concat, Effect.provide(ctx)),
    send: () =>
      pipe(
        Repository.telemetry.Log.get(),
        Effect.flatMap(logs =>
          Fetch.json({
            method: 'POST',
            url: telemetryServerUrl + '/api/v1/sorteio-times/logs',
            headers: {},
            body: logs,
          }),
        ),
        Effect.flatMap(() => Repository.telemetry.Log.clear()),
        Effect.provide(ctx),
      ),
  })),
}) {}

export class TelemetryLog extends Schema.Class<TelemetryLog>('TelemetryLog')({
  timestamp: Timestamp.Timestamp,
  event: Schema.String,
  data: Schema.Unknown,
}) {}
