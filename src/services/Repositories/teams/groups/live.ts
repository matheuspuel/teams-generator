import { GroupsState } from 'src/slices/groups'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const GroupsRepositoryLive: Repository['teams']['Groups'] =
  createStorage({ key: 'teams/Groups', schema: GroupsState })
