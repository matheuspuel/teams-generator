/* eslint-disable functional/functional-parameters */
import * as Context from 'effect/Context'
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
    groupOrder: F.serviceFunctions(RepositoryEnvs.teams.groupOrder),
    groups: F.serviceFunctions(RepositoryEnvs.teams.groups),
    parameters: F.serviceFunctions(RepositoryEnvs.teams.parameters),
  },
  telemetry: {
    log: F.serviceFunctions(RepositoryEnvs.telemetry.log),
  },
  metadata: {
    installation: F.serviceFunctions(RepositoryEnvs.metadata.installation),
  },
}
