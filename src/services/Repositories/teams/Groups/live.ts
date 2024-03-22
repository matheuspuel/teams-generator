import { GroupsState } from 'src/slices/groups'
import { createStorage } from 'src/utils/storage'
import { GroupsRepository } from '.'

export const GroupsRepositoryLive: GroupsRepository = createStorage({
  key: 'teams/Groups',
  schema: GroupsState,
})
