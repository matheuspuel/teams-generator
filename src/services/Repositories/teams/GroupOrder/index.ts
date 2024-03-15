import { Effect } from 'fp'
import { GroupOrder } from 'src/datatypes'

export type GroupOrderRepository = {
  get: () => Effect<GroupOrder, unknown>
  set: (value: GroupOrder) => Effect<void, unknown>
}
