/* eslint-disable functional/functional-parameters */
import * as Context from '@effect/data/Context'
import { Eff } from 'src/utils/fp'
import * as Repositories from './repositories'

export { Repositories }

export const RepositoryEnvs = {
  teams: {
    groupOrder: Context.Tag<{
      Repositories: { teams: { groupOrder: Repositories.teams.groupOrder } }
    }>(),
    groups: Context.Tag<{
      Repositories: { teams: { groups: Repositories.teams.groups } }
    }>(),
    parameters: Context.Tag<{
      Repositories: { teams: { parameters: Repositories.teams.parameters } }
    }>(),
  },
  telemetry: {
    installation: Context.Tag<{
      Repositories: {
        telemetry: { installation: Repositories.telemetry.installation }
      }
    }>(),
    log: Context.Tag<{
      Repositories: {
        telemetry: { log: Repositories.telemetry.log }
      }
    }>(),
  },
}

export const Repository = {
  teams: {
    groupOrder: {
      get: Eff.flatMap(
        RepositoryEnvs.teams.groupOrder,
        r => r.Repositories.teams.groupOrder.get,
      ),
      set: (...args: Parameters<Repositories.teams.groupOrder['set']>) =>
        Eff.flatMap(RepositoryEnvs.teams.groupOrder, r =>
          r.Repositories.teams.groupOrder.set(...args),
        ),
    },
    groups: {
      get: Eff.flatMap(
        RepositoryEnvs.teams.groups,
        r => r.Repositories.teams.groups.get,
      ),
      set: (...args: Parameters<Repositories.teams.groups['set']>) =>
        Eff.flatMap(RepositoryEnvs.teams.groups, r =>
          r.Repositories.teams.groups.set(...args),
        ),
    },
    parameters: {
      get: Eff.flatMap(
        RepositoryEnvs.teams.parameters,
        r => r.Repositories.teams.parameters.get,
      ),
      set: (...args: Parameters<Repositories.teams.parameters['set']>) =>
        Eff.flatMap(RepositoryEnvs.teams.parameters, r =>
          r.Repositories.teams.parameters.set(...args),
        ),
    },
  },
  telemetry: {
    installation: {
      get: Eff.flatMap(
        RepositoryEnvs.telemetry.installation,
        r => r.Repositories.telemetry.installation.get,
      ),
      set: (...args: Parameters<Repositories.telemetry.installation['set']>) =>
        Eff.flatMap(RepositoryEnvs.telemetry.installation, r =>
          r.Repositories.telemetry.installation.set(...args),
        ),
    },
    log: {
      get: Eff.flatMap(
        RepositoryEnvs.telemetry.log,
        r => r.Repositories.telemetry.log.get,
      ),
      concat: (...args: Parameters<Repositories.telemetry.log['concat']>) =>
        Eff.flatMap(RepositoryEnvs.telemetry.log, r =>
          r.Repositories.telemetry.log.concat(...args),
        ),
      clear: Eff.flatMap(
        RepositoryEnvs.telemetry.log,
        r => r.Repositories.telemetry.log.clear,
      ),
    },
  },
}
