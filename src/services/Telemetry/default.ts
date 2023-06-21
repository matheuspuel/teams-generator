import { $, $f, Eff } from 'fp'
import * as Fetch from 'src/utils/Fetch'
import * as Metadata from 'src/utils/Metadata'
import { Telemetry } from '.'
import { AsyncStorageLive } from '../AsyncStorage/live'
import { Repository, RepositoryEnvs } from '../Repositories'
import { defaultLogRepository } from '../Repositories/telemetry/log/default'

const logRepository = defaultLogRepository({ AsyncStorage: AsyncStorageLive })

const telemetryServerUrl = Metadata.matchEnv({
  production: 'https://telemetry-production.up.railway.app',
  staging: 'http://192.168.3.2:8080',
  preview: 'http://192.168.3.2:8080',
  development: 'http://192.168.3.2:8080',
})

export const defaultTelemetry: Telemetry = {
  log: $f(
    Repository.telemetry.log.concat,
    Eff.provideService(RepositoryEnvs.telemetry.log, {
      Repositories: { telemetry: { log: logRepository } },
    }),
  ),
  send: $(
    Repository.telemetry.log.get,
    Eff.flatMap(logs =>
      Fetch.json({
        method: 'POST',
        url: telemetryServerUrl + '/api/v1/sorteio-times/logs',
        headers: {},
        body: logs,
      }),
    ),
    Eff.flatMap(() => Repository.telemetry.log.clear),
    Eff.provideService(RepositoryEnvs.telemetry.log, {
      Repositories: { telemetry: { log: logRepository } },
    }),
  ),
}
