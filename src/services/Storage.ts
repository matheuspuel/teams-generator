import { D } from 'fp'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { createStorage } from 'src/utils/storage'
import { Group } from '../datatypes/Group'
import { Parameters } from '../datatypes/Parameters'

export const GroupsStorage = createStorage<GroupsState>({
  key: 'core/groups',
  schema: D.record(Id as any, Group) as any,
})

export const ParametersStorage = createStorage<Parameters>({
  key: 'core/parameters',
  schema: Parameters,
})
