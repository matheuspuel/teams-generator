import { TeamsRepositories } from '.'
import { GroupOrderRepositoryLive } from './GroupOrder/live'
import { GroupsRepositoryLive } from './Groups/live'
import { ModalityRepositoryLive } from './Modality/live'
import { ParametersRepositoryLive } from './Parameters/live'
import { PreferencesRepositoryLive } from './Preferences/live'

export const TeamsRepositoriesLive: TeamsRepositories = {
  Parameters: ParametersRepositoryLive,
  Groups: GroupsRepositoryLive,
  GroupOrder: GroupOrderRepositoryLive,
  Modality: ModalityRepositoryLive,
  Preferences: PreferencesRepositoryLive,
}
