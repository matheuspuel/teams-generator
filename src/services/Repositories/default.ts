import { D } from 'fp'
import { Group, Parameters } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { createStorage } from 'src/utils/storage'
import { GroupsRepository, ParametersRepository } from '.'

export const defaultGroupsRepository: GroupsRepository =
  createStorage<GroupsState>({
    key: 'core/groups',
    schema: D.record(Id as any, Group.Schema) as any,
  })

export const defaultParametersRepository: ParametersRepository =
  createStorage<Parameters>({
    key: 'core/parameters',
    schema: Parameters.Schema,
  })
