import { Effect } from 'effect'
import { GroupOrder } from 'src/datatypes'

export type GroupOrderRepository = {
  get: () => Effect.Effect<GroupOrder, unknown>
  set: (value: GroupOrder) => Effect.Effect<void, unknown>
}
