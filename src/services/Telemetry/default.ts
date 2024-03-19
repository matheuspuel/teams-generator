import { Effect, Layer, flow, pipe } from 'effect'
import * as Fetch from 'src/utils/Fetch'
import * as Metadata from 'src/utils/Metadata'
import { TelemetryEnv } from '.'
import { Repository } from '../Repositories'
import { RepositoryEnv } from '../Repositories/tag'

const telemetryServerUrl = Metadata.matchEnv({
  production: 'https://telemetry-production.up.railway.app',
  staging: 'http://192.168.3.2:8080',
  preview: 'http://192.168.3.2:8080',
  development: 'http://192.168.3.2:8080',
})

export const TelemetryLive = Effect.map(Effect.context<RepositoryEnv>(), ctx =>
  TelemetryEnv.context({
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
  }),
).pipe(Layer.effectContext)
