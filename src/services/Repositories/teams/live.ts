import { TeamsRepositories } from '.'
import { GroupOrderRepositoryLive } from './GroupOrder/live'
import { GroupsRepositoryLive } from './Groups/live'
import { ParametersRepositoryLive } from './Parameters/live'

export const TeamsRepositoriesLive: TeamsRepositories = {
  Parameters: ParametersRepositoryLive,
  Groups: GroupsRepositoryLive,
  GroupOrder: GroupOrderRepositoryLive,
}
