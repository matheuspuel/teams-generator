import { D } from 'fp'
import { createStorage } from 'src/utils/storage'
import { Group } from './datatypes/Group'
import { Parameters } from './datatypes/Parameters'
import { GroupsState } from './redux/slices/groups'

export const GroupsStorage = createStorage<GroupsState>({
  key: 'core/groups',
  decoder: D.record(Group),
})

export const ParametersStorage = createStorage<Parameters>({
  key: 'core/parameters',
  decoder: Parameters,
})
