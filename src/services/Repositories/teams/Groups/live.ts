import { GroupsState } from 'src/slices/groups'
import { createStorage } from 'src/utils/storage'
import type { GroupsRepository } from '.'

export const GroupsRepositoryLive: GroupsRepository = createStorage({
  key: 'teams/Groups',
  schema: GroupsState,
})
