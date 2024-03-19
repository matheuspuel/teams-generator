import { Effect } from 'effect'
import { RepositoryEnv } from '../tag'
import { GroupOrderRepository } from './GroupOrder'
import { GroupsRepository } from './Groups'
import { ModalityRepository } from './Modality'
import { ParameterRepository } from './Parameters'

export type TeamsRepositories = {
  Parameters: ParameterRepository
  Groups: GroupsRepository
  GroupOrder: GroupOrderRepository
  Modality: ModalityRepository
}

export const TeamsRepositories = {
  Parameters: {
    get: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.teams.Parameters.get,
    ),
    set: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.teams.Parameters.set,
    ),
  },
  Groups: {
    get: Effect.serviceFunctionEffect(RepositoryEnv, r => r.teams.Groups.get),
    set: Effect.serviceFunctionEffect(RepositoryEnv, r => r.teams.Groups.set),
  },
  GroupOrder: {
    get: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.teams.GroupOrder.get,
    ),
    set: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.teams.GroupOrder.set,
    ),
  },
  Modality: {
    get: Effect.serviceFunctionEffect(RepositoryEnv, r => r.teams.Modality.get),
    set: Effect.serviceFunctionEffect(RepositoryEnv, r => r.teams.Modality.set),
  },
}
