import { Effect } from 'effect'
import type { Repository } from '..'
import type { GroupOrderRepository } from './GroupOrder'
import type { GroupsRepository } from './Groups'
import type { ModalityRepository } from './Modality'
import type { ParameterRepository } from './Parameters'
import type { PreferencesRepository } from './Preferences'

export type TeamsRepositories = {
  Parameters: ParameterRepository
  Groups: GroupsRepository
  GroupOrder: GroupOrderRepository
  Modality: ModalityRepository
  Preferences: PreferencesRepository
}

export const TeamsRepositories = (Tag: typeof Repository) => ({
  Parameters: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.Parameters)),
  Groups: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.Groups)),
  GroupOrder: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.GroupOrder)),
  Modality: Effect.serviceFunctions(Effect.map(Tag, r => r.teams.Modality)),
  Preferences: Effect.serviceFunctions(
    Effect.map(Tag, r => r.teams.Preferences),
  ),
})
