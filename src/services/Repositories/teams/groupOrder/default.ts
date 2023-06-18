import { GroupOrder } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { Repositories } from '../..'

export const defaultGroupOrderRepository: Repositories.teams.groupOrder =
  createStorage<GroupOrder, GroupOrder>({
    key: 'core/groupOrder',
    schema: GroupOrder.Schema,
  })
