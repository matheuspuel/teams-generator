import { D } from 'fp'
import { Group } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { createStorage } from 'src/utils/storage'
import { Repositories } from '../..'

const key = 'core/groups'

export const defaultGroupsRepository: Repositories.teams.groups = createStorage<
  Record<string, D.From<typeof Group.Schema>>,
  GroupsState
>({
  key: key,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  schema: D.record(Id as any, Group.Schema),
})
