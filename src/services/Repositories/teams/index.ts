import { F } from 'src/utils/fp'
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
    get: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.Parameters.get),
    set: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.Parameters.set),
  },
  Groups: {
    get: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.Groups.get),
    set: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.Groups.set),
  },
  GroupOrder: {
    get: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.GroupOrder.get),
    set: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.GroupOrder.set),
  },
  Modality: {
    get: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.Modality.get),
    set: F.serviceFunctionEffect(RepositoryEnv, r => r.teams.Modality.set),
  },
}
