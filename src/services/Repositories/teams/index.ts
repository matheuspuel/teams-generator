import { Effect } from 'effect'
import { Repository } from '..'
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

export const TeamsRepositories = (Tag: typeof Repository) => ({
  Parameters: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.Parameters)),
  Groups: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.Groups)),
  GroupOrder: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.GroupOrder)),
  Modality: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.Modality)),
})
