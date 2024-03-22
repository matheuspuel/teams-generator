import { GroupOrder } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { GroupOrderRepository } from '.'

export const GroupOrderRepositoryLive: GroupOrderRepository = createStorage<
  GroupOrder,
  GroupOrder
>({
  key: 'core/groupOrder',
  schema: GroupOrder.GroupOrder,
})
