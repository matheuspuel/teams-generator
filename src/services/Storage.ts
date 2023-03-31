import { D } from 'fp'
import { Group, Parameters } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { createStorage } from 'src/utils/storage'

export const GroupsStorage = createStorage<GroupsState>({
  key: 'core/groups',
  schema: D.record(Id as any, Group.Schema) as any,
})

export const ParametersStorage = createStorage<Parameters>({
  key: 'core/parameters',
  schema: Parameters.Schema,
})
