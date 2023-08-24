/* eslint-disable functional/functional-parameters */
import * as Context from '@effect/data/Context'
import { F } from 'src/utils/fp'
import * as Repositories from './repositories'

export { Repositories }

export const RepositoryEnvs = {
  teams: {
    groupOrder: Context.Tag<Repositories.teams.groupOrder>(),
    groups: Context.Tag<Repositories.teams.groups>(),
    parameters: Context.Tag<Repositories.teams.parameters>(),
  },
  telemetry: {
    log: Context.Tag<Repositories.telemetry.log>(),
  },
  metadata: {
    installation: Context.Tag<Repositories.metadata.installation>(),
  },
}

export const Repository = {
  teams: {
    groupOrder: {
      get: F.flatMap(RepositoryEnvs.teams.groupOrder, r => r.get),
      set: (...args: Parameters<Repositories.teams.groupOrder['set']>) =>
        F.flatMap(RepositoryEnvs.teams.groupOrder, r => r.set(...args)),
    },
    groups: {
      get: F.flatMap(RepositoryEnvs.teams.groups, r => r.get),
      set: (...args: Parameters<Repositories.teams.groups['set']>) =>
        F.flatMap(RepositoryEnvs.teams.groups, r => r.set(...args)),
    },
    parameters: {
      get: F.flatMap(RepositoryEnvs.teams.parameters, r => r.get),
      set: (...args: Parameters<Repositories.teams.parameters['set']>) =>
        F.flatMap(RepositoryEnvs.teams.parameters, r => r.set(...args)),
    },
  },
  telemetry: {
    log: {
      get: F.flatMap(RepositoryEnvs.telemetry.log, r => r.get),
      concat: (...args: Parameters<Repositories.telemetry.log['concat']>) =>
        F.flatMap(RepositoryEnvs.telemetry.log, r => r.concat(...args)),
      clear: F.flatMap(RepositoryEnvs.telemetry.log, r => r.clear),
    },
  },
  metadata: {
    installation: {
      get: F.flatMap(RepositoryEnvs.metadata.installation, r => r.get),
      set: (...args: Parameters<Repositories.metadata.installation['set']>) =>
        F.flatMap(RepositoryEnvs.metadata.installation, r => r.set(...args)),
    },
  },
}
