import { $, $f, Eff, O, Option, identity } from 'fp'
import * as Fetch from 'src/utils/Fetch'
import * as Metadata from 'src/utils/Metadata'
import { Ref } from 'src/utils/datatypes'
import { Telemetry } from '.'
import { AsyncStorageLive } from '../AsyncStorage/live'
import { IdGenerator, IdGeneratorEnv } from '../IdGenerator'
import { defaultIdGenerator } from '../IdGenerator/default'
import { Repository, RepositoryEnvs } from '../Repositories'
import { defaultInstallationRepository } from '../Repositories/telemetry/installation/default'
import { defaultLogRepository } from '../Repositories/telemetry/log/default'

const telemetryRef = Ref.create<
  Option<{ installation: { id: string }; launch: { id: string } }>
>(O.none())

const logRepository = defaultLogRepository({ AsyncStorage: AsyncStorageLive })

const telemetryServerUrl = Metadata.matchEnv({
  production: 'https://telemetry-production.up.railway.app',
  staging: 'http://192.168.3.2:8080',
  preview: 'http://192.168.3.2:8080',
  development: 'http://192.168.3.2:8080',
})

export const defaultTelemetry: Telemetry = {
  getInfo: $(
    telemetryRef.getState,
    Eff.flatMap(identity),
    Eff.orElse(() =>
      $(
        Eff.all({
          installation: $(
            Repository.telemetry.installation.get,
            Eff.orElse(() =>
              $(
                IdGenerator.generate,
                Eff.map(id => ({ id })),
                Eff.tap(
                  $f(
                    Repository.telemetry.installation.set,
                    Eff.catchAll(Eff.unit),
                  ),
                ),
              ),
            ),
          ),
          launch: Eff.map(IdGenerator.generate, id => ({ id })),
        }),
        Eff.tap($f(O.some, telemetryRef.setState)),
      ),
    ),
    Eff.provideService(RepositoryEnvs.telemetry.installation, {
      Repositories: {
        telemetry: { installation: defaultInstallationRepository },
      },
    }),
    Eff.provideService(IdGeneratorEnv, { idGenerator: defaultIdGenerator }),
  ),
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
