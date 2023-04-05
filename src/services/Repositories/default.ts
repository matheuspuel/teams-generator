import { D } from 'fp'
import { Group, Parameters } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { createStorage } from 'src/utils/storage'
import { GroupsRepository, ParametersRepository } from '.'

export const defaultGroupsRepository: GroupsRepository =
  createStorage<GroupsState>({
    key: 'core/groups',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    schema: D.record(Id as any, Group.Schema) as any,
  })

export const defaultParametersRepository: ParametersRepository =
  createStorage<Parameters>({
    key: 'core/parameters',
    schema: Parameters.Schema,
  })