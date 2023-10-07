import { GroupOrder } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const GroupOrderRepositoryLive: Repository['teams']['GroupOrder'] =
  createStorage<GroupOrder, GroupOrder>({
    key: 'core/groupOrder',
    schema: GroupOrder.Schema,
  })
