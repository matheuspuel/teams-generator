import { F, Layer, flow, pipe } from 'fp'
import * as Fetch from 'src/utils/Fetch'
import * as Metadata from 'src/utils/Metadata'
import { TelemetryEnv } from '.'
import { Repository } from '../Repositories'

const telemetryServerUrl = Metadata.matchEnv({
  production: 'https://telemetry-production.up.railway.app',
  staging: 'http://192.168.3.2:8080',
  sponsor: 'http://192.168.3.2:8080',
  preview: 'http://192.168.3.2:8080',
  development: 'http://192.168.3.2:8080',
})

export const TelemetryLive = F.map(F.context<Repository>(), ctx =>
  TelemetryEnv.context({
    log: flow(Repository.telemetry.Log.concat, F.provide(ctx)),
    send: () =>
      pipe(
        Repository.telemetry.Log.get(),
        F.flatMap(logs =>
          Fetch.json({
            method: 'POST',
            url: telemetryServerUrl + '/api/v1/sorteio-times/logs',
            headers: {},
            body: logs,
          }),
        ),
        F.flatMap(() => Repository.telemetry.Log.clear()),
        F.provide(ctx),
      ),
  }),
).pipe(Layer.effectContext)
