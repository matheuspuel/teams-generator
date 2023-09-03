import { $, $f, F, Layer } from 'fp'
import * as Fetch from 'src/utils/Fetch'
import * as Metadata from 'src/utils/Metadata'
import { TelemetryEnv } from '.'
import { Repositories, Repository } from '../Repositories'

const telemetryServerUrl = Metadata.matchEnv({
  production: 'https://telemetry-production.up.railway.app',
  staging: 'http://192.168.3.2:8080',
  preview: 'http://192.168.3.2:8080',
  development: 'http://192.168.3.2:8080',
})

export const TelemetryLive = F.map(
  F.context<Repositories.telemetry.log>(),
  ctx =>
    TelemetryEnv.context({
      log: $f(Repository.telemetry.log.concat, F.provideContext(ctx)),
      send: () =>
        $(
          Repository.telemetry.log.get(),
          F.flatMap(logs =>
            Fetch.json({
              method: 'POST',
              url: telemetryServerUrl + '/api/v1/sorteio-times/logs',
              headers: {},
              body: logs,
            }),
          ),
          F.flatMap(() => Repository.telemetry.log.clear()),
          F.provideContext(ctx),
        ),
    }),
).pipe(Layer.effectContext)
